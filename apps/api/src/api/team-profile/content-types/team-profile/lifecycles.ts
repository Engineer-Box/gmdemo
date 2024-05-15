import { errors } from "@strapi/utils";
import { resolveRelationIdForHookData } from "../../../../util";
const { ApplicationError } = errors;

const onDelete = async (teamProfileId: number) => {
  const teamProfileToBeDeleted = await strapi
    .service("api::team-profile.team-profile")
    .findOne(teamProfileId, { populate: { team: true, profile: true } });

  await strapi.db.query("api::notification.notification").delete({
    where: {
      type: "TEAM_INVITE_RECEIVED",
      team: teamProfileToBeDeleted.team.id,
      profile: teamProfileToBeDeleted.profile.id,
    },
  });
};

export default {
  async beforeDeleteMany(ev) {
    // Ideally we would delete notifications here too but unfortunately strapi doesn't give us access to the relations here
    throw new ApplicationError("You cannot delete a team profile");
  },

  async beforeDelete() {
    throw new ApplicationError("You cannot delete a team profile");
  },

  async afterCreateMany({ params: { data }, result }) {
    // Bulk operations don't support relations and the result doesn't contain the created relations
    throw new ApplicationError(
      "afterCreateMany has been disabled for team-profile",
    );
  },

  async beforeUpdate({ params: { where, data }, state }) {
    // Link the gamer tag to the team profile
    const teamProfileToBeUpdated = await strapi.db
      .query("api::team-profile.team-profile")
      .findOne({
        where,
        populate: { team: { populate: { game: true } }, profile: true },
      });
    const gameId = teamProfileToBeUpdated.team.game.id;
    const profileId = teamProfileToBeUpdated.profile.id;

    if (
      data.is_pending === false &&
      teamProfileToBeUpdated.is_pending === true
    ) {
      const gamerTagForTeamsGame = await strapi.db
        .query("api::gamer-tag.gamer-tag")
        .findOne({
          where: {
            game: gameId,
            profile: profileId,
          },
        });

      if (!gamerTagForTeamsGame) {
        throw new ApplicationError(
          "You must have a gamer tag for the game of the team you are trying to join",
        );
      }
      data.gamer_tag = gamerTagForTeamsGame?.id;
    }

    // Save the initial team profile to the state
    state.initialTeamProfile = teamProfileToBeUpdated;
  },

  async afterUpdate({ result, state }) {
    const wasDeleted = result.deleted && !state.initialTeamProfile.deleted;
    if (wasDeleted) {
      await onDelete(result.id);
    }
  },

  async beforeCreate(event) {
    const { params } = event;
    // Link the gamer tag to the team profile
    const profileId = resolveRelationIdForHookData(params.data.profile);
    const teamId = resolveRelationIdForHookData(params.data.team);

    const gameForTeam = await strapi.db.query("api::team.team").findOne({
      where: {
        id: teamId,
      },
      populate: {
        game: true,
      },
    });

    const gameId = gameForTeam.game.id;

    // Note this should only ever be true for founders
    if (!params.data.is_pending) {
      const gamerTagForTeamsGame = await strapi.db
        .query("api::gamer-tag.gamer-tag")
        .findOne({
          where: {
            game: gameId,
            profile: profileId,
          },
        });

      if (!gamerTagForTeamsGame) {
        throw new Error(
          "You must have a gamer tag for the game of the team you are trying to join",
        );
      }

      params.data.gamer_tag = gamerTagForTeamsGame?.id;
    }
  },

  async afterCreate({ result }) {
    if (result.deleted) {
      await onDelete(result.id);
    }
  },
};
