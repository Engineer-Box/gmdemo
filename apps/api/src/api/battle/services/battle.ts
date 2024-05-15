/**
 * battle service
 */

import { factories } from "@strapi/strapi";
import { completeBattle } from "./complete-battle";

export enum AddTeamToBattleErrors {
  BattleUnavailable = "BattleUnavailable",
  InvalidInput = "InvalidInput",
  SquadNotEligible = "SquadNotEligible",
}

export enum CancelBattleErrors {
  NotFound = "NotFound",
}

export default factories.createCoreService("api::battle.battle", {
  async completeBattle(battleId: number, winningSide: "home" | "away") {
    return await completeBattle(battleId, winningSide);
  },

  async getTeamCaptains(battleId: number) {
    // TODO: Deprecate this and just use the match service
    const battle = await super.findOne(battleId, {
      populate: {
        match: true,
      },
    });

    return await strapi
      .service("api::match.match")
      .getTeamCaptains(battle.match.id);
  },
  async cancelBattle(battleId: number) {
    // This will cancel the battle regardless of anything
    const battleToCancel = await super.findOne(battleId, {
      populate: {
        match_options: true,
        transactions: true,
        match: {
          populate: {
            home_team: {
              populate: {
                team: true,
                team_selection_profiles: {
                  populate: {
                    team_profile: {
                      populate: {
                        profile: true,
                      },
                    },
                  },
                },
              },
            },
            away_team: {
              populate: {
                team: true,
                team_selection_profiles: {
                  populate: {
                    team_profile: {
                      populate: {
                        profile: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!battleToCancel || battleToCancel.is_cancelled) {
      return;
    }

    let wasCancelled = false;

    try {
      await super.update(battleId, {
        data: {
          is_cancelled: true,
        },
      });
      wasCancelled = true;

      const transactionsToDelete = (battleToCancel.transactions ?? []).map(
        (transaction) => transaction.id,
      );

      await strapi
        .service("api::transaction.transaction")
        .safeBulkDelete(transactionsToDelete);
    } catch (error) {
      if (wasCancelled) {
        await strapi.service("api::battle.battle").update(battleToCancel, {
          data: {
            is_cancelled: false,
          },
        });
      }
    }
  },

  async addTeamToBattle({
    battleId,
    captainsTeamProfileId,
    teamSelectionTeamProfileIds,
    isAwayTeam,
  }: {
    battleId: number;
    captainsTeamProfileId: number;
    teamSelectionTeamProfileIds: number[];
    isAwayTeam: boolean;
  }) {
    const battle = await strapi
      .service("api::battle.battle")
      .findOne(battleId, {
        populate: {
          invited_team: true,
          match_options: {
            populate: {
              game: true,
            },
          },
          match: {
            populate: {
              home_team: {
                populate: {
                  team: true,
                },
              },
              away_team: {
                populate: {
                  team: true,
                },
              },
            },
          },
        },
      });

    if (!battle) {
      throw new Error(AddTeamToBattleErrors.BattleUnavailable);
    }
    const isBattleExpired = new Date(battle.date) < new Date();
    const isBattleJoined = isAwayTeam
      ? !!battle.match.away_team
      : !!battle.match.home_team;

    const isBattleCancelled = battle.is_cancelled;

    if (isBattleExpired || isBattleJoined || isBattleCancelled) {
      throw new Error(AddTeamToBattleErrors.BattleUnavailable);
    }

    const captainsTeamProfile = await strapi
      .service("api::team-profile.team-profile")
      .findOne(captainsTeamProfileId, {
        populate: {
          profile: true,
          team: {
            populate: {
              team_profiles: {
                populate: {
                  profile: true,
                },
              },
              game: {},
            },
          },
        },
      });

    if (
      !captainsTeamProfile ||
      captainsTeamProfile.deleted ||
      captainsTeamProfile.team.deleted
    ) {
      throw new Error(AddTeamToBattleErrors.InvalidInput);
    }

    const isCaptainLeaderOrFounder =
      captainsTeamProfile.role === "founder" ||
      captainsTeamProfile.role === "leader";

    if (!isCaptainLeaderOrFounder) {
      throw new Error(AddTeamToBattleErrors.InvalidInput);
    }

    if (isAwayTeam) {
      if (
        battle.invited_team &&
        battle.invited_team.id !== captainsTeamProfile.team.id
      ) {
        throw new Error(AddTeamToBattleErrors.InvalidInput);
      }
    }

    const teamSelectionProfileIds = [
      ...teamSelectionTeamProfileIds.filter(
        (teamProfileId) => teamProfileId !== captainsTeamProfile.id,
      ),
      captainsTeamProfile.id,
    ];

    const isSquadLengthValid =
      teamSelectionProfileIds.length === battle.match_options.team_size;

    if (!isSquadLengthValid) {
      throw new Error(AddTeamToBattleErrors.InvalidInput);
    }

    const isTeamInSameGame =
      captainsTeamProfile.team.game.id === battle.match_options.game.id;

    const isAttemptingToJoinWithTheSameTeam = isAwayTeam
      ? battle.match.away_team?.id === captainsTeamProfile.team.id
      : battle.match.home_team?.id === captainsTeamProfile.team.id;

    if (!isTeamInSameGame || isAttemptingToJoinWithTheSameTeam) {
      throw new Error(AddTeamToBattleErrors.InvalidInput);
    }

    let createdTeamSelectionId;
    let createdTransactionsIds = [];

    try {
      const teamSelectionRelationKey = isAwayTeam ? "away_match" : "home_match";

      const createdTeamSelection = await strapi
        .service("api::team-selection.team-selection")
        .create({
          data: {
            team: captainsTeamProfile.team.id,
            [teamSelectionRelationKey]: { connect: [battle.match.id] },
          },
        });

      createdTeamSelectionId = createdTeamSelection.id;

      const wagerAmountPerPerson =
        battle.pot_amount / 2 / teamSelectionProfileIds.length;

      await Promise.all(
        teamSelectionProfileIds.map(async (teamProfileId) => {
          const teamProfile = await strapi
            .service("api::team-profile.team-profile")
            .findOne(teamProfileId, {
              populate: {
                profile: true,
                team: true,
              },
            });

          if (teamProfile.deleted) {
            throw new Error(AddTeamToBattleErrors.SquadNotEligible);
          }

          const isCaptain = teamProfile.id === captainsTeamProfile.id;
          const wagerMode = teamProfile.profile.wager_mode;
          const isSameTeamAsCaptain =
            teamProfile.team.id === captainsTeamProfile.team.id;
          const trustMode = teamProfile.profile.trust_mode;
          const isPending = teamProfile.is_pending;

          if (isPending || !isSameTeamAsCaptain) {
            throw new Error(AddTeamToBattleErrors.SquadNotEligible);
          }

          if (wagerAmountPerPerson && !wagerMode) {
            throw new Error(AddTeamToBattleErrors.SquadNotEligible);
          }

          if (wagerAmountPerPerson && !isCaptain && !trustMode) {
            throw new Error(AddTeamToBattleErrors.SquadNotEligible);
          }

          const hasSufficientFunds =
            teamProfile.profile.balance >= wagerAmountPerPerson;

          if (!hasSufficientFunds) {
            throw new Error(AddTeamToBattleErrors.SquadNotEligible);
          }

          await strapi
            .service("api::team-selection-profile.team-selection-profile")
            .create({
              data: {
                team_selection: createdTeamSelectionId,
                team_profile: teamProfile.id,
                is_captain: isCaptain,
              },
            });

          if (wagerAmountPerPerson > 0) {
            const createdTransaction = await strapi
              .service("api::transaction.transaction")
              .create({
                data: {
                  type: "out",
                  confirmed: true,
                  amount: wagerAmountPerPerson,
                  profile: teamProfile.profile.id,
                  battle: battle.id,
                },
              });
            createdTransactionsIds.push(createdTransaction.id);
          }
        }),
      );

      try {
        if (!isAwayTeam) {
          await strapi
            .service("api::notification.notification")
            .createEnrolledInBattleNotification({
              battleId: battleId,
              teamSelectionId: createdTeamSelectionId,
            });
        } else {
          await strapi
            .service("api::notification.notification")
            .createBattleConfirmedNotification(battleId);
        }
      } catch (error) { }
    } catch (error) {
      if (createdTeamSelectionId) {
        const teamSelectionToDelete = await strapi
          .service("api::team-selection.team-selection")
          .findOne(createdTeamSelectionId, {
            populates: {
              team_selection_profiles: true,
            },
          });

        await Promise.all(
          (teamSelectionToDelete.team_selection_profiles ?? []).map(
            async (tsp) =>
              strapi
                .service("api::team-selection-profile.team-selection-profile")
                .delete(tsp.id),
          ),
        );

        await strapi
          .service("api::team-selection.team-selection")
          .delete(createdTeamSelectionId);
      }

      await Promise.all(
        createdTransactionsIds.map((transactionId) =>
          strapi.service("api::transaction.transaction").delete(transactionId),
        ),
      );

      throw error;
    }
    return battle;
  },
});
