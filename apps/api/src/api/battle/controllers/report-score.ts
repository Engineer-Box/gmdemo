import { z } from "zod";

const reportScoreInputSchema = z.object({
  reporting_side: z.enum(["home", "away"]),
  reported_winners_side: z.enum(["home", "away"]),
});

export const reportScore = async (ctx) => {
  const battleId = parseInt(ctx.request.params.battleId);
  const parseInputResult = reportScoreInputSchema.safeParse(
    ctx.request.body.data,
  );

  if (!battleId || !parseInputResult.success) {
    return ctx.badRequest();
  }

  const { reporting_side, reported_winners_side } = parseInputResult.data;

  const teamCaptains = await strapi
    .service("api::battle.battle")
    .getTeamCaptains(battleId);

  // Ensure the user is the captain
  const profile = await strapi
    .service("api::profile.profile")
    .findOneByWalletAddress(ctx.state.wallet_address);

  const teamCaptain = teamCaptains[reporting_side];

  if (!profile || teamCaptain.profile.id !== profile.id) {
    return ctx.unauthorized();
  }

  const battle = await strapi.entityService.findOne(
    "api::battle.battle",
    battleId,
    {
      populate: {
        transactions: {
          populate: {
            profile: true,
          },
        },
        match: {
          populate: {
            home_team: {
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
            },
            away_team: {
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
            },
          },
        },
      },
    },
  );

  const isMatchComplete = !!battle.match.result;
  const hasTeamReported = !!battle.match[`${reporting_side}_team_vote`];
  const hasBattleStarted = new Date(battle.date) < new Date();
  const wasCancelled = !!battle.is_cancelled;

  if (isMatchComplete || hasTeamReported || wasCancelled || !hasBattleStarted) {
    return ctx.badRequest();
  }

  const updatedMatch = await strapi
    .service("api::match.match")
    .update(battle.match.id, {
      data: {
        last_vote_date: new Date().toISOString(),
        [`${reporting_side}_team_vote`]: reported_winners_side,
      },
      populate: {
        dispute: true,
      },
    });

  const haveBothTeamsReported =
    updatedMatch.home_team_vote && updatedMatch.away_team_vote;

  if (haveBothTeamsReported) {
    const doTeamsAgreeOnWinner =
      updatedMatch.home_team_vote === updatedMatch.away_team_vote;

    if (doTeamsAgreeOnWinner) {
      await strapi
        .service("api::battle.battle")
        .completeBattle(battleId, updatedMatch.home_team_vote);
    } else {
      await strapi.service("api::match.match").openDispute(updatedMatch.id);
    }
  }

  return 200;
};
