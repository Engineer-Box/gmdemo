import { sharedConfig } from "./notification";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/notifications/mark-all-as-seen",
      handler: "notification.markAllAsSeen",
      config: {
        ...sharedConfig,
      },
    },
    ,
  ],
};
