export const profilePopulate = {
  avatar: true,
  social_links: true,
  vouched_by: {
    populate: true,
  },
  vouched_for: {
    populate: true,
  },
  favourite_games: {
    populate: {
      square_image: true,
    },
  },
  gamer_tags: {
    populate: {
      game: {
        populate: {
          square_image: true,
        },
      },
    },
  },
  team_profiles: {
    filters: {
      deleted: { $ne: true },
    },
    populate: {
      invited_by: true,
      team: {
        populate: {
          image: true,
          game: true,
        },
      },
    },
  },
};
