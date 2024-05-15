import { Strapi } from "@strapi/strapi";
import { redis } from "../redis";

const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
const isStage = process.env.NEXT_PUBLIC_APP_ENV === "staging";

export default (config, { strapi }: { strapi: Strapi }) => {
  return async (ctx, next) => {
    if (!ctx.state.api_token) {
      const ip = ctx.request.ip;
      const minute = new Date().getUTCMinutes();
      const key = `rate-limit:ip:${ip}:minute:${minute}`;
      const hits = await redis.get(key);

      if (!hits) {
        await redis.set(key, 1, "EX", 300);
      } else {
        await redis.incr(key);
      }

      if (hits && parseInt(hits) > (isDev || isStage ? 1000 : 50)) {
        return ctx.tooManyRequests();
      }
    }
    return await next();
  };
};
