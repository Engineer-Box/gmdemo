import { Strapi } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    const isApi = ctx.url.startsWith("/api");

    if (isApi) {
      const siteSettings = await strapi
        .service("api::site-settings.site-settings")
        .find();

      const isDown = siteSettings?.maintenance;

      if (isDown) {
        return ctx.serviceUnavailable();
      }
    }

    return await next();
  };
};
