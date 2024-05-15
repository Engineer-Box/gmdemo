import merge from "deepmerge";

export default {
  async beforeDeleteMany(event) {
    throw new Error("You cannot delete teams");
  },
  async beforeDelete(event) {
    throw new Error("You cannot delete a team");
  },

  async beforeCreate({ params }) {
    // cannot set with deleted
    if (params.data.deleted) {
      throw new Error("You cannot create a team with deleted");
    }
  },

  async beforeUpdate({ params, state }) {
    const initialTeam = await strapi
      .service("api::team.team")
      .findOne(params.where.id);
    state.initialTeam = initialTeam;
  },
  async afterUpdate({ result, state }) {
    const initialTeam = state.initialTeam;

    if (result.deleted && !initialTeam.deleted) {
      const deletedTeamWithTeamProfiles = await strapi
        .service("api::team.team")
        .findOne(result.id, {
          populate: {
            team_profiles: true,
          },
        });

      await Promise.all(
        deletedTeamWithTeamProfiles.team_profiles.map((tp) => {
          return strapi.service("api::team-profile.team-profile").delete(tp.id);
        }),
      );
    }
  },
};
