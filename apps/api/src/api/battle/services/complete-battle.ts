const canBattleBeCompleted = async (battle) => {
  const isMatchComplete = !!battle.match.result;
  const hasBattleStarted = new Date(battle.date) < new Date();
  const wasCancelled = !!battle.is_cancelled;
  const isOpenDispute =
    battle.match.dispute && !battle.match.dispute.resolved_winner;

  return (
    !isMatchComplete && hasBattleStarted && !wasCancelled && !isOpenDispute
  );
};

const teamSelectionPopulate = {
  populate: {
    team: {
      populate: {
        image: true,
      },
    },
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
};

const getGamerlyFee = (totalPot: number, teamSize: number) => {
  const winningsInCents = totalPot / 2;
  const minimumGamerlyFee = winningsInCents / 10;
  const winningsPerPerson = Math.floor(
    (winningsInCents - minimumGamerlyFee) / teamSize,
  );
  const finalGamerlyFee = winningsInCents - winningsPerPerson * teamSize;

  return finalGamerlyFee;
};
const getGameProfileXp = async (profileId: number, gameId: number) => {
  const teamSelectionProfiles = await strapi.db
    .query("api::team-selection-profile.team-selection-profile")
    .findMany({
      populate: {
        team_profile: {
          populate: {
            profile: true,
          },
        },
      },
      where: {
        xp: { $notNull: true },
        team_profile: {
          profile: {
            id: profileId,
          },
          team: {
            game: {
              id: gameId,
            },
          },
        },
      },
    });

  const totalXp = teamSelectionProfiles.reduce(
    (acc, { xp }) => acc + xp,
    10000,
  );
  return Math.max(10, totalXp);
};

const addGameProfileXpToTeamSelectionProfiles = async (
  teamSelectionProfiles: any[],
  gameId: number,
) =>
  Promise.all(
    teamSelectionProfiles.map(async (tsp) => {
      const gameProfileXp = await getGameProfileXp(
        tsp.team_profile.profile.id,
        gameId,
      );

      return {
        ...tsp,
        gameProfileXp,
      };
    }),
  );

const getAverageXp = (teamSelectionProfilesWithXp) =>
  teamSelectionProfilesWithXp.reduce((acc, tsp) => acc + tsp.gameProfileXp, 0) /
  teamSelectionProfilesWithXp.length;

const getXpWithinBoundary = (xp: number) => {
  const isNegative = xp < 0;
  const positiveXp = Math.abs(xp);
  const xpWithinBoundary = Math.round(Math.min(Math.max(positiveXp, 50), 300));

  return xpWithinBoundary * (isNegative ? -1 : 1);
};

const resetTeamSelectionResultMeta = async (teamSelectionId: number) => {
  await strapi
    .service("api::team-selection.team-selection")
    .update(teamSelectionId, {
      data: {
        earnings: null,
        xp: null,
      },
    });
};
const resetTeamSelectionProfileResultMeta = async (
  teamProfileIds: number[],
) => {
  await Promise.all(
    teamProfileIds.map(async (id) => {
      await strapi
        .service("api::team-selection-profile.team-selection-profile")
        .update(id, {
          data: {
            earnings: null,
            xp: null,
          },
        });
    }),
  );
};

const setTeamSelectionProfileResultMeta = async ({
  didWin,
  teamSelectionProfilesWithXp,
  opposingTeamsAverageXp,
  totalPot,
  gamerlyFee,
}: {
  didWin: boolean;
  teamSelectionProfilesWithXp: any[];
  opposingTeamsAverageXp: number;
  totalPot: number;
  gamerlyFee: number;
}) => {
  let updatedTeamSelectionProfileIds = [];

  try {
    await Promise.all(
      teamSelectionProfilesWithXp.map(async (tsp) => {
        const xpChange = getXpWithinBoundary(
          (didWin
            ? opposingTeamsAverageXp / tsp.gameProfileXp
            : -tsp.gameProfileXp / opposingTeamsAverageXp) * 100,
        );

        const earningsChange = didWin
          ? (totalPot / 2 - gamerlyFee) / teamSelectionProfilesWithXp.length
          : -totalPot / 2 / teamSelectionProfilesWithXp.length;

        await strapi
          .service("api::team-selection-profile.team-selection-profile")
          .update(tsp.id, {
            data: {
              xp: xpChange,
              earnings: earningsChange,
              did_win: !!didWin,
            },
          });

        updatedTeamSelectionProfileIds.push(tsp.id);
      }),
    );
  } catch (error) {
    await resetTeamSelectionProfileResultMeta(updatedTeamSelectionProfileIds);
    throw error;
  }

  return updatedTeamSelectionProfileIds;
};

const setTeamSelectionResultMeta = async ({
  didWin,
  teamSelectionId,
  winningTeamsAverageXp,
  losingTeamsAverageXp,
  totalPot,
  gamerlyFee,
}: {
  didWin: boolean;
  teamSelectionId: number;
  winningTeamsAverageXp: number;
  losingTeamsAverageXp: number;
  totalPot: number;
  gamerlyFee: number;
}) => {
  try {
    const teamXpChange =
      getXpWithinBoundary(
        (losingTeamsAverageXp / winningTeamsAverageXp) * 100,
      ) * (didWin ? 1 : -1);
    const earningsChange = didWin ? totalPot / 2 - gamerlyFee : -totalPot / 2;

    await strapi
      .service("api::team-selection.team-selection")
      .update(teamSelectionId, {
        data: {
          earnings: earningsChange,
          xp: teamXpChange,
          did_win: !!didWin,
        },
      });
  } catch (error) {
    await resetTeamSelectionResultMeta(teamSelectionId);
    throw error;
  }

  return teamSelectionId;
};

const sendBattleCompletedNotifications = async (
  battleId: number,
  winningTeamSelection: any,
  losingTeamSelection: any,
) => {
  const profileIdsToNotify = [
    ...winningTeamSelection.team_selection_profiles,
    ...losingTeamSelection.team_selection_profiles,
  ].map((tsp) => tsp.team_profile.profile.id);

  await Promise.all(
    profileIdsToNotify.map(async (profileId) => {
      await strapi
        .service("api::notification.notification")
        .createRedirectNotification(profileId, {
          title: `Battle completed`,
          path: `/battle/${battleId}`,
          image: winningTeamSelection.team.image,
        });
    }),
  );
};

export const completeBattle = async (
  battleId: number,
  winningSide: "home" | "away",
) => {
  const battle = await strapi.service("api::battle.battle").findOne(battleId, {
    populate: {
      match_options: {
        populate: { game: true },
      },
      transactions: {
        populate: {
          profile: true,
        },
      },
      match: {
        populate: {
          dispute: true,
          home_team: teamSelectionPopulate,
          away_team: teamSelectionPopulate,
        },
      },
    },
  });

  if (!canBattleBeCompleted(battle)) {
    throw new Error("Battle cannot be completed");
  }

  let updatedMatch;
  let updatedWinningTeamSelectionProfileIds;
  let updatedLosingTeamSelectionProfileIds;
  let updatedWinningTeamSelectionId;
  let updatedLosingTeamSelectionId;

  try {
    const winningTeamSelection = battle.match[`${winningSide}_team`];
    const losingTeamSelection =
      battle.match[`${winningSide === "home" ? "away" : "home"}_team`];
    const teamSize = winningTeamSelection.team_selection_profiles.length;
    const totalPot = battle.pot_amount;
    const gamerlyFee = getGamerlyFee(totalPot, teamSize);
    const gameId = battle.match_options.game.id;

    const feeTracker = await strapi
      .service("api::fee-tracker.fee-tracker")
      .find();

    const fees = feeTracker?.collected_fees ?? 0;

    await strapi.service("api::fee-tracker.fee-tracker").createOrUpdate({
      data: {
        collected_fees: fees + gamerlyFee,
      },
    });

    updatedMatch = await strapi
      .service("api::match.match")
      .update(battle.match.id, {
        data: {
          result: winningSide,
          completed_date: new Date(),
        },
      });

    const winningTeamSelectionProfilesWithXp =
      await addGameProfileXpToTeamSelectionProfiles(
        winningTeamSelection.team_selection_profiles,
        gameId,
      );

    const losingTeamSelectionProfilesWithXp =
      await addGameProfileXpToTeamSelectionProfiles(
        losingTeamSelection.team_selection_profiles,
        gameId,
      );

    const winningTeamsAverageXp = getAverageXp(
      winningTeamSelectionProfilesWithXp,
    );
    const losingTeamsAverageXp = getAverageXp(
      losingTeamSelectionProfilesWithXp,
    );

    updatedWinningTeamSelectionProfileIds =
      await setTeamSelectionProfileResultMeta({
        didWin: true,
        teamSelectionProfilesWithXp: winningTeamSelectionProfilesWithXp,
        opposingTeamsAverageXp: losingTeamsAverageXp,
        totalPot,
        gamerlyFee,
      });

    updatedLosingTeamSelectionProfileIds =
      await setTeamSelectionProfileResultMeta({
        didWin: false,
        teamSelectionProfilesWithXp: losingTeamSelectionProfilesWithXp,
        opposingTeamsAverageXp: winningTeamsAverageXp,
        totalPot,
        gamerlyFee,
      });

    updatedWinningTeamSelectionId = await setTeamSelectionResultMeta({
      didWin: true,
      teamSelectionId: winningTeamSelection.id,
      winningTeamsAverageXp,
      losingTeamsAverageXp,
      totalPot,
      gamerlyFee,
    });

    updatedLosingTeamSelectionId = await setTeamSelectionResultMeta({
      didWin: false,
      teamSelectionId: losingTeamSelection.id,
      winningTeamsAverageXp,
      losingTeamsAverageXp,
      totalPot,
      gamerlyFee,
    });

    if (totalPot && totalPot > 0) {
      const transactionsToCreate =
        winningTeamSelectionProfilesWithXp
          .map((tsp) => tsp.team_profile.profile.id)
          .filter((id) =>
            battle.transactions.find(
              (t) => t.profile.id === id && t.type === "out",
            ),
          )
          .map((id) => ({
            profile: id,
            battle: battle.id,
            type: "in",
            amount: totalPot - gamerlyFee / teamSize,
            confirmed: true,
          })) ?? [];

      await strapi
        .service("api::transaction.transaction")
        .safeBulkCreate(transactionsToCreate);
    }

    try {
      await sendBattleCompletedNotifications(
        battle.id,
        winningTeamSelection,
        losingTeamSelection,
      );
    } catch (error) {}
    try {
      await strapi
        .service("api::leaderboard.leaderboard")
        .updateLeaderboardsForMatch(battle.match.id);
    } catch (error) {}
  } catch (error) {
    if (updatedWinningTeamSelectionProfileIds) {
      await resetTeamSelectionProfileResultMeta(
        updatedWinningTeamSelectionProfileIds,
      );
    }

    if (updatedLosingTeamSelectionProfileIds) {
      await resetTeamSelectionProfileResultMeta(
        updatedLosingTeamSelectionProfileIds,
      );
    }

    if (updatedWinningTeamSelectionId) {
      await resetTeamSelectionResultMeta(updatedWinningTeamSelectionId);
    }

    if (updatedLosingTeamSelectionId) {
      await resetTeamSelectionResultMeta(updatedLosingTeamSelectionId);
    }

    if (updatedMatch) {
      await strapi.service("api::match.match").update(updatedMatch.id, {
        data: {
          result: null,
          completed_date: null,
        },
      });
    }
  }
};
