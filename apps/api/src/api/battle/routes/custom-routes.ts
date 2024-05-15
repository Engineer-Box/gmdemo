module.exports = {
  routes: [
    {
      method: "POST",
      path: "/battles/create/:teamProfileId",
      handler: "battle.createBattle",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "POST",
      path: "/battles/join/:battleId",
      handler: "battle.joinBattle",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "GET",
      path: "/battles/decline-invitation/:battleId",
      handler: "battle.declineBattleInvitation",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "GET",
      path: "/battles/cancel/:battleId",
      handler: "battle.cancelBattle",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "GET",
      path: "/battles/withdraw-cancellation-request/:battleId",
      handler: "battle.withdrawCancellationRequest",
      config: {
        policies: ["global::is-user"],
      },
    },
    {
      method: "POST",
      path: "/battles/report-score/:battleId",
      handler: "battle.reportScore",
      config: {
        policies: ["global::is-user"],
      },
    },
  ],
};
