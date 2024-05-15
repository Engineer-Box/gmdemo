export default {
  routes: [
    {
      method: "GET",
      path: "/leaderboard/:gameId",
      handler: "leaderboard.getLeaderboard",
      config: {
        policies: ["global::is-user"],
        middlewares: [],
      },
    },
  ],
};
