/**
 * battle controller
 */

import { factories } from "@strapi/strapi";
import { joinBattle } from "./join-battle";
import { createBattle } from "./create-battle";
import { reportScore } from "./report-score";

const getCustomTeamSelectionPopulate = (side: "home" | "away", ctx) => {
  const teamSelectionPopulate =
    ctx.query?.populate?.match?.populate?.[`${side}_team`]?.populate;

  const teamHasCustomPopulate =
    teamSelectionPopulate.team?.populate?.leaderboard_item_stats;

  const teamProfileHasCustomPopulate =
    teamSelectionPopulate.team_selection_profiles?.populate?.team_profile
      ?.populate?.leaderboard_item_stats;

  if (!teamHasCustomPopulate && !teamProfileHasCustomPopulate) {
    return null;
  }

  return teamSelectionPopulate;
};

export default factories.createCoreController("api::battle.battle", {
  async findOne(ctx) {
    const battle = await strapi
      .service("api::battle.battle")
      .findOne(ctx.params.id, ctx.query);

    if (!battle) {
      return ctx.notFound();
    }

    const homeTeamSelectionId = battle?.match?.home_team?.id;
    const awayTeamSelectionId = battle?.match?.away_team?.id;

    if (homeTeamSelectionId) {
      const customHomeTeamSelectionPopulate = getCustomTeamSelectionPopulate(
        "home",
        ctx,
      );
      if (customHomeTeamSelectionPopulate) {
        battle.match.home_team = await strapi
          .service("api::team-selection.team-selection")
          .findOne(homeTeamSelectionId, {
            populate: customHomeTeamSelectionPopulate,
          });
      }
    }

    if (awayTeamSelectionId) {
      const customAwayTeamSelectionPopulate = getCustomTeamSelectionPopulate(
        "away",
        ctx,
      );
      if (customAwayTeamSelectionPopulate) {
        battle.match.away_team = await strapi
          .service("api::team-selection.team-selection")
          .findOne(awayTeamSelectionId, {
            populate: customAwayTeamSelectionPopulate,
          });
      }
    }

    return this.transformResponse(battle);
  },
  async find(ctx) {
    const { results, pagination } = await strapi
      .service("api::battle.battle")
      .find(ctx.query);

    await Promise.all(
      results.map(async (battle) => {
        const homeTeamSelectionId = battle?.match?.home_team?.id;
        const awayTeamSelectionId = battle?.match?.away_team?.id;

        if (homeTeamSelectionId) {
          const customHomeTeamSelectionPopulate =
            getCustomTeamSelectionPopulate("home", ctx);

          if (customHomeTeamSelectionPopulate) {
            battle.match.home_team = await strapi
              .service("api::team-selection.team-selection")
              .findOne(homeTeamSelectionId, {
                populate: customHomeTeamSelectionPopulate,
              });
          }
        }

        if (awayTeamSelectionId) {
          const customAwayTeamSelectionPopulate =
            getCustomTeamSelectionPopulate("away", ctx);

          if (customAwayTeamSelectionPopulate) {
            battle.match.away_team = await strapi
              .service("api::team-selection.team-selection")
              .findOne(awayTeamSelectionId, {
                populate: customAwayTeamSelectionPopulate,
              });
          }
        }
      }),
    );

    return this.transformResponse(results, { pagination });
  },

  async createBattle(ctx) {
    return await createBattle(ctx);
  },
  async joinBattle(ctx) {
    return await joinBattle(ctx);
  },

  async reportScore(ctx) {
    return await reportScore(ctx);
  },

  async declineBattleInvitation(ctx) {
    const battleId = parseInt(ctx.request.params.battleId);
    const battle = await strapi
      .service("api::battle.battle")
      .findOne(battleId, {
        populate: {
          match_options: true,
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
            },
          },
          invited_team: {
            populate: {
              team_profiles: {
                populate: {
                  profile: true,
                },
              },
            },
          },
        },
      });

    if (!battle) {
      return ctx.notFound();
    }

    const teamProfile = battle.invited_team.team_profiles.find(
      (tp) => tp.profile.wallet_address === ctx.state.wallet_address,
    );

    const isLeaderOrFounder =
      teamProfile &&
      (teamProfile.role === "leader" || teamProfile.role === "founder");

    if (!isLeaderOrFounder) {
      return ctx.unauthorized();
    }

    const homeTeam = battle.match.home_team;

    await strapi.service("api::battle.battle").cancelBattle(battleId);

    try {
      await strapi
        .service("api::notification.notification")
        .createChallengeInviteDeclinedNotification(
          homeTeam.team_selection_profiles.find((tsp) => tsp.is_captain)
            ?.team_profile.profile.id,
          battle.invited_team.name,
          homeTeam.team.id,
        );
    } catch (error) {}

    return battle;
  },
  async cancelBattle(ctx) {
    const battleId = parseInt(ctx.request.params.battleId);

    const battle = await strapi
      .service("api::battle.battle")
      .findOne(battleId, {
        populate: {
          match_options: true,
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

    if (!battle) {
      return ctx.notFound();
    }

    const teamCaptains = await strapi
      .service("api::battle.battle")
      .getTeamCaptains(battleId);
    const isPending = !battle.match.away_team;

    if (isPending) {
      const isCaptain =
        teamCaptains.home.profile.wallet_address === ctx.state.wallet_address;

      if (!isCaptain) {
        return ctx.unauthorized();
      }

      // Cancel the battle
      await strapi.service("api::battle.battle").cancelBattle(battleId);
    } else {
      const isRequesterHomeTeamCaptain =
        teamCaptains.home.profile.wallet_address === ctx.state.wallet_address;

      const isRequesterAwayTeamCaptain =
        teamCaptains.away?.profile.wallet_address === ctx.state.wallet_address;

      if (!isRequesterHomeTeamCaptain && !isRequesterAwayTeamCaptain) {
        return ctx.unauthorized();
      }

      const team = isRequesterHomeTeamCaptain ? "home" : "away";
      const otherTeam = isRequesterHomeTeamCaptain ? "away" : "home";

      const didOtherTeamRequestCancellation =
        battle.cancellation_requested_by === otherTeam;

      if (didOtherTeamRequestCancellation) {
        await strapi.service("api::battle.battle").cancelBattle(battleId);

        await strapi.services[
          "api::notification.notification"
        ].createRedirectNotification(teamCaptains[otherTeam].profile.id, {
          title: `Your cancellation request was accepted by ${teamCaptains[team].team.name}`,
          image: teamCaptains[team].team.image,
          path: `/battle/${battleId}`,
        });
      } else {
        if (battle.cancellation_requested_by !== team) {
          await strapi.service("api::battle.battle").update(battleId, {
            data: {
              cancellation_requested_by: team,
            },
          });

          await strapi.services[
            "api::notification.notification"
          ].createRedirectNotification(teamCaptains[otherTeam].profile.id, {
            title: `${teamCaptains[otherTeam].team.name} has requested to cancel the battle`,
            image: teamCaptains[team].team.image,
            path: `/battle/${battleId}`,
          });
        }
      }
    }

    ctx.send({}, 200);
  },
  async withdrawCancellationRequest(ctx) {
    const battleId = parseInt(ctx.request.params.battleId);

    const battle = await strapi.service("api::battle.battle").findOne(battleId);

    if (!battle) {
      return ctx.notFound();
    }
    if (battle.cancellation_requested_by === null) {
      return ctx.badRequest("No cancellation request has been made");
    }

    const teamCaptains = await strapi
      .service("api::battle.battle")
      .getTeamCaptains(battleId);

    const walletAddressOfTeamCaptainThatRequestedToCancel =
      teamCaptains[battle.cancellation_requested_by]?.profile.wallet_address;

    console.log({ walletAddressOfTeamCaptainThatRequestedToCancel });
    if (
      walletAddressOfTeamCaptainThatRequestedToCancel !==
      ctx.state.wallet_address
    ) {
      return ctx.unauthorized();
    }

    await strapi.service("api::battle.battle").update(battleId, {
      data: {
        cancellation_requested_by: null,
      },
    });

    const otherTeam =
      battle.cancellation_requested_by === "home" ? "away" : "home";

    await strapi.services[
      "api::notification.notification"
    ].createRedirectNotification(teamCaptains[otherTeam].profile.id, {
      title: `${teamCaptains[otherTeam].team.name} has withdrawn their cancellation request`,
      image: teamCaptains[battle.cancellation_requested_by].team.image,
      path: `/battle/${battleId}`,
    });

    ctx.send({}, 200);
  },
});
