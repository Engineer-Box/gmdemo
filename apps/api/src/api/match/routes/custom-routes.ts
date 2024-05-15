export default {
  routes: [
    {
      method: "GET",
      path: "/matches/open-dispute/:id",
      handler: "match.openDispute",
      config: {
        policies: ["global::is-user"],
      },
    },
  ],
};
