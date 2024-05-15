module.exports = {
  routes: [
    {
      method: "POST",
      path: "/transactions/deposit",
      handler: "transaction.deposit",
      config: {
        middlewares: ["api::transaction.no-reentry"],
        policies: ["global::is-user"],
      },
    },
    {
      method: "POST",
      path: "/transactions/withdraw",
      handler: "transaction.withdraw",
      config: {
        middlewares: ["api::transaction.no-reentry"],
        policies: ["global::is-user"],
      },
    },
  ],
};
