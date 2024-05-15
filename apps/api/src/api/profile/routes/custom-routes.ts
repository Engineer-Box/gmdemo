module.exports = {
  routes: [
    {
      method: "GET",
      path: "/profiles/with-vouch-and-leaderboard-stats/:profileId",
      handler: "profile.getProfileWithVouchAndLeaderboardStats",
      config: {},
    },
    {
      method: "GET",
      path: "/profiles/vouch/:profileId",
      handler: "profile.vouch",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "GET",
      path: "/profiles/favourite-game/:gameId",
      handler: "profile.favouriteGame",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "GET",
      path: "/profiles/by-wallet-address/:walletAddress",
      handler: "profile.findOneByWalletAddress",
      config: {},
    },
    {
      method: "GET",
      path: "/profiles/log-online-user",
      handler: "profile.logOnlineUser",
      config: {
        policies: ["global::is-user"],
      },
    },
  ],
};
