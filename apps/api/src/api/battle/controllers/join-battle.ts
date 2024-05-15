import { errors } from "@strapi/utils";
import { z } from "zod";
import { AddTeamToBattleErrors } from "../services/battle";

const joinBattleInputSchema = z.object({
  team_profile_id: z.number(),
  team_selection: z.array(z.number()),
});

export const joinBattle = async (ctx) => {
  const battleId = parseInt(ctx.request.params.battleId);
  const parseInputResult = joinBattleInputSchema.safeParse(
    ctx.request.body.data,
  );

  if (!parseInputResult.success) {
    return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
  }

  const input = parseInputResult.data;

  const captainsTeamProfile = await strapi
    .service("api::team-profile.team-profile")
    .findOne(input.team_profile_id, {
      populate: {
        profile: true,
      },
    });

  if (!captainsTeamProfile || captainsTeamProfile.deleted) {
    throw new errors.UnauthorizedError();
  }

  const isCaptain =
    captainsTeamProfile.profile.wallet_address === ctx.state.wallet_address;

  if (!isCaptain) {
    throw new errors.UnauthorizedError();
  }

  try {
    await strapi.service("api::battle.battle").addTeamToBattle({
      captainsTeamProfileId: input.team_profile_id,
      teamSelectionTeamProfileIds: input.team_selection,
      battleId,
      isAwayTeam: true,
    });

    const battle = await strapi
      .service("api::battle.battle")
      .findOne(battleId, { populate: { match: true } });

    await strapi.service("api::match.match").generateMatchMeta(battle.match.id);
  } catch (error) {
    if (error.message === AddTeamToBattleErrors.BattleUnavailable) {
      return ctx.badRequest(AddTeamToBattleErrors.BattleUnavailable);
    }
    if (error.message === AddTeamToBattleErrors.SquadNotEligible) {
      return ctx.badRequest(AddTeamToBattleErrors.SquadNotEligible);
    }

    throw error;
  }
  return strapi.service("api::battle.battle").findOne(battleId);
};
