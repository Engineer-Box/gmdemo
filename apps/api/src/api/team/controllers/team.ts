/**
 * team controller
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

export default factories.createCoreController(
  "api::team.team",
  ({ strapi }) => ({
    async findOne(ctx) {
      const team = await strapi
        .service("api::team.team")
        .findOne(ctx.params.id, ctx.query);

      if (!team) {
        return ctx.notFound();
      }

      return this.transformResponse(team);
    },
    async find(ctx) {
      const { results, pagination } = await strapi
        .service("api::team.team")
        .find(ctx.query);

      return this.transformResponse(results, { pagination });
    },
    async update(ctx) {
      const teamId = parseInt(ctx.request.params.id);

      const team = await strapi
        .service("api::team.team")
        .findOneNotDeleted(teamId);

      if (!team) {
        throw new errors.NotFoundError();
      }

      const foundersTeamProfile = await strapi
        .service("api::team-profile.team-profile")
        .findFounderTeamProfile(teamId);

      const isFounder =
        foundersTeamProfile.profile.wallet_address !== ctx.state.wallet_address;

      if (isFounder) {
        throw new errors.UnauthorizedError();
      }

      return await super.update(ctx);
    },
    async delete(ctx) {
      // No need to sanitize query because we're not returning data in a meaningful way (just confirmation its deleted)
      // Check if the user is a founder
      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const teamId = ctx.params.id;

      const founderTeamProfile = await strapi
        .service("api::team-profile.team-profile")
        .findFounderTeamProfile(teamId);

      if (founderTeamProfile.profile.id !== profile.id) {
        throw new errors.UnauthorizedError();
      }

      const hasPendingResults = await strapi
        .service("api::team.team")
        .hasPendingResults(teamId);

      if (hasPendingResults.hasPendingResults) {
        return ctx.badRequest("PendingResults");
      }

      return await strapi.service("api::team.team").delete(teamId);
    },

    async create(ctx) {
      // Get the profile making the request and create the founder
      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address, {
          populate: {
            team_profiles: {
              filters: {
                deleted: { $ne: true },
              },
              populate: {
                team: {
                  populate: {
                    game: true,
                  },
                },
              },
            },
          },
        });

      const profileHasGamerTagForTeamsGame = await strapi
        .service("api::gamer-tag.gamer-tag")
        .doesProfileHaveGamerTagForGame(profile.id, ctx.request.body.data.game);

      if (!profileHasGamerTagForTeamsGame) {
        return ctx.badRequest(
          "You need a gamer tag for this game to create a team",
        );
      }

      const gameIdsProfileHasTeamsFor = profile.team_profiles.map(
        (tp) => tp.team.game.id,
      );

      if (gameIdsProfileHasTeamsFor.includes(ctx.request.body.data.game)) {
        return ctx.badRequest("You already have a team for this game");
      }

      if (!profile) {
        throw new errors.UnauthorizedError();
      }

      if (ctx.request.body.data.team_profiles) {
        return ctx.badRequest();
      }

      const createdTeam = await super.create(ctx);

      // Create the founder
      await strapi.service("api::team-profile.team-profile").createOrRestore({
        data: {
          team: createdTeam.data.id,
          profile: profile.id,
          role: "founder",
          is_pending: false,
        },
      });
      const query = await this.sanitizeQuery(ctx);

      // Refetch the team and return (with the owner)
      const updatedCreatedTeam = await strapi
        .service("api::team.team")
        .findOne(createdTeam.data.id, query);

      const sanitizedUpdatedCreatedTeam = await this.sanitizeOutput(
        updatedCreatedTeam,
        ctx,
      );
      // Puts it in the data/meta format
      return this.transformResponse(sanitizedUpdatedCreatedTeam);
    },

    async leave(ctx) {
      const teamId = parseInt(ctx.params.id);

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const teamProfile = await strapi
        .service("api::team-profile.team-profile")
        .findTeamProfileByProfileId(teamId, profile.id);

      if (!teamProfile || teamProfile.deleted) {
        throw new errors.NotFoundError();
      }

      // Don't allow the founder to leave
      if (teamProfile.role === "founder") {
        return ctx.badRequest("Founders can not leave");
      }

      const hasPendingResults = await strapi
        .service("api::team.team")
        .hasPendingResults(teamId);

      if (
        hasPendingResults.hasPendingResults &&
        hasPendingResults.participatingTeamProfileIds.includes(teamProfile.id)
      ) {
        return ctx.badRequest("PendingResults");
      }

      return await strapi
        .service("api::team-profile.team-profile")
        .delete(teamProfile.id);
    },

    async bulkUpdateMembers(ctx) {
      const query = await this.sanitizeQuery(ctx);
      const teamId = parseInt(ctx.params.id);
      const { data: teamMemberUpdates } = ctx.request.body ?? [];

      const teamBeforeUpdates = await strapi
        .service("api::team.team")
        .findOneNotDeleted(teamId, {
          populate: {
            team_profiles: {
              filters: {
                deleted: { $ne: true },
              },
              populate: {
                profile: true,
              },
            },
          },
        });

      if (!teamBeforeUpdates) {
        throw new errors.NotFoundError();
      }
      const teamProfiles = teamBeforeUpdates.team_profiles ?? [];
      const pendingResults = await strapi
        .service("api::team.team")
        .hasPendingResults(teamId);

      // Team profile is in the request data but not the original team
      const teamProfilesToCreateOrRestore = teamMemberUpdates.filter(
        (tmu) => !teamProfiles.some((tp) => tp.profile.id === tmu.profile),
      );

      // Team profile is in the original team but not the request data
      const teamProfilesToDelete = teamProfiles
        .filter(
          (tp) =>
            !teamMemberUpdates.some((tmu) => tmu.profile === tp.profile.id),
        )
        .map((tp) => ({ id: tp.id, role: tp.role, profile: tp.profile.id }));

      const attemptingToDeleteProfilesWithPendingResults =
        teamProfilesToDelete.some((tp) =>
          pendingResults.participatingTeamProfileIds.includes(tp.id),
        );

      if (attemptingToDeleteProfilesWithPendingResults) {
        return ctx.badRequest("PendingResults");
      }

      const teamProfilesToUpdate = teamProfiles
        .map((tp) => {
          const teamMemberUpdate = teamMemberUpdates.find(
            (tmu) => tp.profile.id === tmu.profile,
          );

          if (teamMemberUpdate && teamMemberUpdate.role !== tp.role) {
            return {
              id: tp.id,
              role: teamMemberUpdate.role,
              profile: tp.profile.id,
            };
          }

          return false;
        })
        .filter(Boolean);

      const attemptingToDemoteMembersWithPendingResults =
        teamProfilesToUpdate.some(
          (tp) =>
            tp.role === "member" &&
            pendingResults.participatingTeamProfileIds.includes(tp.id),
        );

      if (attemptingToDemoteMembersWithPendingResults) {
        return ctx.badRequest("PendingResults");
      }

      const profile = await await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      if (!profile) {
        throw new errors.UnauthorizedError();
      }

      const requesterTeamProfile = teamProfiles.find(
        (tp) => tp.profile.id === profile.id,
      );

      const requestersRole = requesterTeamProfile?.role;

      const playersWereDeleted = teamProfilesToDelete.length > 0;
      const playersWereUpdated = teamProfilesToUpdate.length > 0;

      const updatesContainsLeader =
        teamProfilesToCreateOrRestore.some((tptc) => tptc.role === "leader") ||
        teamProfilesToUpdate.some((tptu) => tptu.role === "leader") ||
        teamProfilesToDelete.some((tptd) => tptd.role === "leader");

      const numberOfFoundersInUpdates =
        teamProfilesToCreateOrRestore.filter((tptc) => tptc.role === "founder")
          .length +
        teamProfilesToUpdate.filter((tptu) => tptu.role === "founder");

      if (numberOfFoundersInUpdates > 1) {
        return ctx.badRequest("Only one founder is allowed");
      }

      if (requestersRole === "member") {
        throw new errors.UnauthorizedError();
      }

      if (
        requestersRole === "leader" &&
        (playersWereDeleted || playersWereUpdated || updatesContainsLeader)
      ) {
        throw new errors.UnauthorizedError();
      }

      // Apply creates
      await Promise.all(
        teamProfilesToCreateOrRestore.map(async (teamProfileToCreate) => {
          await strapi
            .service("api::team-profile.team-profile")
            .createOrRestore({
              data: {
                team: teamId,
                profile: teamProfileToCreate.profile,
                role: teamProfileToCreate.role,
                invited_by: profile.id,
                is_pending: true,
              },
            });
        }),
      );

      // Apply updates
      await Promise.all(
        teamProfilesToUpdate.map(async ({ role, id }) => {
          await strapi.service("api::team-profile.team-profile").update(id, {
            data: {
              role,
            },
          });
        }),
      );

      // Apply deletes
      await Promise.all(
        teamProfilesToDelete.map(async ({ id }) => {
          await strapi.service("api::team-profile.team-profile").delete(id);
        }),
      );

      // TODO: This should filter out the deleted profiles
      const refreshedTeam = await strapi
        .service("api::team.team")
        .findOne(teamId, query);

      const sanitizedRefreshedTeam = await this.sanitizeOutput(
        refreshedTeam,
        ctx,
      );

      return this.transformResponse(sanitizedRefreshedTeam);
    },
    async getPendingResults(ctx) {
      const teamId = parseInt(ctx.params.id);

      const team = await strapi
        .service("api::team.team")
        .findOneNotDeleted(teamId, {
          populate: {
            team_profiles: {
              populate: {
                profile: true,
              },
            },
          },
        });

      if (!team) {
        throw new errors.NotFoundError();
      }

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const teamProfileForTeam = await strapi
        .service("api::team-profile.team-profile")
        .findTeamProfileByProfileId(teamId, profile.id);

      if (
        !teamProfileForTeam ||
        teamProfileForTeam.deleted ||
        teamProfileForTeam.is_pending ||
        teamProfileForTeam.role === "member"
      ) {
        throw new errors.UnauthorizedError();
      }

      const pendingResults = await strapi
        .service("api::team.team")
        .hasPendingResults(teamId);

      // TODO: Stick this logic in the service
      const participatingProfileIds =
        pendingResults?.participatingTeamProfileIds?.map(
          (tpId) => team.team_profiles.find((tp) => tp.id === tpId).profile.id,
        ) ?? [];

      return {
        ...pendingResults,
        participatingProfileIds,
      };
    },
  }),
);
