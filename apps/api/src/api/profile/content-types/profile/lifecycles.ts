// Note that the reason we populate the balance in a hook is so that we can see the balance in the admin panel

export default {
  async beforeCreate(event) {
    event.params.data.balance = 0;
  },
  async beforeCreateMany(event) {
    event.params.data.forEach((profile) => {
      profile.balance = 0;
    });
  },
  async beforeUpdateMany(event) {
    event.params.data.forEach((profile) => {
      profile.balance = 0;
    });
  },
  async beforeUpdate(event) {
    event.params.data.balance = 0;
  },
  async afterFindOne(event) {
    const shouldCalculateBalance =
      event?.result && Object.keys(event.result).includes("balance");

    if (shouldCalculateBalance) {
      const profileId = event.result.id;
      const balance = await strapi
        .service("api::profile.profile")
        .getBalanceForProfile(profileId);
      event.result.balance = balance;
    }
  },
  async afterFindMany(event) {
    const profileIds = event?.result.map(({ id }) => id);

    const shouldCalculateBalance =
      event?.result[0] && Object.keys(event.result[0]).includes("balance");

    if (shouldCalculateBalance) {
      const profileBalances = await strapi
        .service("api::profile.profile")
        .getBalanceForProfiles(profileIds);

      event.result.forEach((profile) => {
        const balance =
          profileBalances.find(({ id }) => id === profile.id)?.balance ?? 0;
        profile.balance = balance;
      });
    }
  },
};
