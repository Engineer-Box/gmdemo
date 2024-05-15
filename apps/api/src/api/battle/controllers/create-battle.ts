import { z } from "zod";
import matchOptionsSchema from "../../../components/general/match-options.json";
import { errors } from "@strapi/utils";
import { AddTeamToBattleErrors } from "../services/battle";
const REGIONS = matchOptionsSchema.attributes.region.enum;

const createBattleInputSchema = z.object({
  wager_amount_per_person: z.number(),
  invited_team_id: z.number().optional(),
  team_selection: z.array(z.number()),
  date: z.string().datetime(),
  match_options: z.object({
    custom_attribute_inputs: z.array(
      z.object({
        attribute_id: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      }),
    ),
    series: z.number(),
    region: z.enum(REGIONS as any),
  }),
});

export const createBattle = async (ctx) => {
  const teamProfileId = parseInt(ctx?.request?.params?.teamProfileId);

  const reqDataResult = createBattleInputSchema.safeParse(
    ctx.request.body.data,
  );

  if (!reqDataResult.success || !teamProfileId) {
    return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
  }

  const reqData = reqDataResult.data;

  const captainsTeamProfile = await strapi
    .service("api::team-profile.team-profile")
    .findOne(teamProfileId, {
      populate: {
        profile: true,
        team: {
          populate: {
            team_profiles: {
              populate: {
                profile: true,
              },
            },
            game: {
              populate: {
                custom_attributes: {
                  populate: {
                    attribute: true,
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!captainsTeamProfile || captainsTeamProfile.deleted) {
    return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
  }

  const isCaptain =
    captainsTeamProfile.profile.wallet_address === ctx.state.wallet_address;

  if (!isCaptain) {
    throw new errors.UnauthorizedError();
  }

  const game = captainsTeamProfile.team.game;
  const team = captainsTeamProfile.team;

  const invitedTeam =
    reqData.invited_team_id &&
    (await strapi
      .service("api::team.team")
      .findOneNotDeleted(reqData.invited_team_id, {
        populate: {
          game: true,
          team_profiles: {
            populate: {
              profile: true,
            },
          },
        },
      }));

  if (reqData.invited_team_id) {
    const invitedTeamExists = !!invitedTeam;
    const isInvitedTeamInSameGame = invitedTeam?.game.id === game.id;
    const isInvitedTeamADifferentTeam = invitedTeam?.id !== team.id;

    if (
      !invitedTeamExists ||
      !isInvitedTeamInSameGame ||
      !isInvitedTeamADifferentTeam
    ) {
      return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
    }
  }

  const teamSelectionProfiles = [
    ...reqData.team_selection.filter(
      (teamProfileId) => teamProfileId !== captainsTeamProfile.id,
    ),
    captainsTeamProfile.id,
  ];

  const isSeriesValid = [1, 3, 5].includes(reqData.match_options.series);
  const isDateValid = new Date(reqData.date) > new Date();

  const isWagerAmountValid =
    reqData.wager_amount_per_person > 0
      ? Number.isInteger(reqData.wager_amount_per_person)
      : true;

  const teamSelectionProfilesAreInTeam = teamSelectionProfiles.every(
    (teamSelectionProfileId) =>
      team.team_profiles.some((tp) => tp.id === teamSelectionProfileId),
  );

  if (
    !isSeriesValid ||
    !isWagerAmountValid ||
    !teamSelectionProfilesAreInTeam ||
    !isDateValid
  ) {
    return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
  }

  const requiredCustomAttributes = game.custom_attributes.filter(
    (ca) => ca.__component === "custom-attributes.select",
  );

  const hasRequiredCustomAttributes = requiredCustomAttributes.every((ra) =>
    reqData.match_options.custom_attribute_inputs.some(
      (cui) => cui.attribute_id === ra.attribute.attribute_id,
    ),
  );

  const customAttributeInputsAreValid =
    reqData.match_options.custom_attribute_inputs.reduce((acc, cui) => {
      if (!acc) return acc;

      const attribute = requiredCustomAttributes.find(
        (ra) => ra.attribute.attribute_id === cui.attribute_id,
      );

      if (attribute.__component === "custom-attributes.select") {
        const validOptionIds = attribute.options.map((o) => o.option_id);

        if (attribute.input_type === "multi-select") {
          return (
            Array.isArray(cui.value) &&
            cui.value.every((v) => validOptionIds.includes(v))
          );
        } else {
          return validOptionIds.includes(cui.value);
        }
      }

      return true;
    }, true);

  if (!hasRequiredCustomAttributes || !customAttributeInputsAreValid) {
    return ctx.badRequest(AddTeamToBattleErrors.InvalidInput);
  }

  let createdBattleId;
  let createdMatchId;

  try {
    const createdBattle = await strapi.service("api::battle.battle").create({
      data: {
        invited_team: reqData.invited_team_id ?? null,
        pot_amount: reqData.wager_amount_per_person
          ? reqData.wager_amount_per_person * teamSelectionProfiles.length * 2
          : 0,
        match_options: {
          custom_attribute_inputs:
            reqData.match_options.custom_attribute_inputs,
          series: reqData.match_options.series,
          team_size: teamSelectionProfiles.length,
          game: game.id,
          region: reqData.match_options.region,
        },
        date: reqData.date,
      },
    });

    createdBattleId = createdBattle.id;

    const createdMatch = await strapi.service("api::match.match").create({
      data: {
        battle: createdBattleId,
        match_meta: {},
      },
    });
    createdMatchId = createdMatch.id;

    await strapi.service("api::battle.battle").addTeamToBattle({
      captainsTeamProfileId: teamProfileId,
      teamSelectionTeamProfileIds: reqData.team_selection,
      battleId: createdBattleId,
      isAwayTeam: false,
    });
  } catch (error) {
    if (createdBattleId) {
      await strapi.service("api::battle.battle").delete(createdBattleId);
    }

    if (createdMatchId) {
      await strapi.service("api::match.match").delete(createdMatchId);
    }

    if (error.message === AddTeamToBattleErrors.SquadNotEligible) {
      return ctx.badRequest(AddTeamToBattleErrors.SquadNotEligible);
    }

    throw error;
  }

  try {
    if (invitedTeam) {
      await strapi
        .service("api::notification.notification")
        .createBattleInviteReceivedNotifications({
          battleId: createdBattleId,
          invitingTeamId: team.id,
          invitedTeamId: invitedTeam.id,
        });
    }
  } catch (error) {}

  return 200;
};
