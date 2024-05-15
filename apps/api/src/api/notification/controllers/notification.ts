/**
 * notification controller
 */
import { errors } from "@strapi/utils";

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::notification.notification",
  {
    async delete(ctx) {
      const { id } = ctx.params;
      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const notification = await strapi
        .service("api::notification.notification")
        .findOne(id, {
          populate: { profile: true },
        });

      if (!profile || notification.profile.id !== profile.id) {
        throw new errors.UnauthorizedError();
      }

      return await super.delete(ctx);
    },

    async markAllAsSeen(ctx) {
      const { profile: profileId } = ctx.request.body.data ?? {};

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      if (!profile || profile.id !== parseInt(profileId)) {
        throw new errors.UnauthorizedError();
      }

      const { results: unseenNotifications } = await strapi
        .service("api::notification.notification")
        .find({ filters: { seen: false, profile: profileId } });

      return await Promise.all(
        unseenNotifications.map(async ({ id }) => {
          await strapi
            .service("api::notification.notification")
            .update(id, { data: { seen: true } });
        }),
      );
    },

    async update(ctx) {
      const data = ctx.request.body.data ?? {};
      const fieldsToUpdate = Object.keys(data);
      const updatableFields = ["seen"];

      for (const fieldToUpdate of fieldsToUpdate) {
        if (!updatableFields.includes(fieldToUpdate)) {
          return ctx.badRequest(`Cannot update ${fieldToUpdate}`);
        }
      }

      return await super.update(ctx);
    },
  },
);
