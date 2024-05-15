// TODO: add other image sizes to this too so that we can use it for the home page search too

const getExtraSmallImageFromEntry = (entry: any, key: string) => {
  try {
    const tinyImage = entry[key].formats.xsmall.url;
    if (!tinyImage) {
      throw new Error();
    }
    return tinyImage;
  } catch (error) {
    return null;
  }
};

export default ({ env }) => {
  return {
    redis: {
        config: {
          connections: {
            default: {
              connection: {
                host: env("REDISHOST"),
                port: env("REDISPORT"),
                username: env("REDISUSER"),
                password: env("REDISPASSWORD"),
                db: 0,
              },
              settings: {
                debug: false,
              },
            },
          },
        },
      },
    redcron: {
      enabled: true,
    },
    "public-permissions": {
      // Everything is public because we handle auth ourselves
      enabled: false,
      config: {
        verbose: true,
        actions: {
          "*": [
            "find",
            "findOne",
            "create",
            "update",
            "delete",
            "markAllAsSeen",
            "bulkUpdateMembers",
            "leave",
            "withdraw",
            "deposit",
            "createBattle",
            "joinBattle",
            "declineBattleInvitation",
            "cancelBattle",
            "reportScore",
            "openDispute",
            "getPendingResults",
            "vouch",
            "findOneByWalletAddress",
            "favouriteGame",
            "getLeaderboard",
            "logOnlineUser",
            "getProfileWithVouchAndLeaderboardItemStats",
            "withdrawCancellationRequest",
          ],
        },
        plugins: {
          "users-permissions.auth": [],
          "users-permissions.permissions": [],
          "users-permissions.role": [],
          "users-permissions.user": [],
          "upload.content-api": ["find", "findOne", "upload"],
        },
      },
    },
    "schemas-to-ts": {
      enabled: false,
    },

    upload: {
      config: {
        provider: "cloudinary",
        providerOptions: {
          cloud_name: env("CLOUDINARY_CLOUD_NAME"),
          api_key: env("CLOUDINARY_API_KEY"),
          api_secret: env("CLOUDINARY_API_SECRET"),
        },
        breakpoints: {
          large: 1000,
          medium: 750,
          xsmall: 64,
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },

    meilisearch: {
      config: {
        host: env("NEXT_PUBLIC_MEILISEARCH_URL", "http://0.0.0.0:7700/"),
        apiKey: env("MEILISEARCH_PRIVATE_API_KEY", "MASTER_KEY"),
        game: {
          indexName: "global",
          settings: {
            filterableAttributes: ["collection_type"],
            sortableAttributes: ["collection_type", "name"],
          },
          transformEntry({ entry }) {
            return {
              id: entry.id,
              collection_type: "games",
              name: entry.title,
              image: entry.square_image,
              slug: entry.slug,
            };
          },
        },
        profile: {
          indexName: "global",
          settings: {
            filterableAttributes: ["collection_type"],
            sortableAttributes: ["collection_type", "name"],
          },
          // Return true if the entry should be indexed
          filterEntry({ entry }) {
            return entry.username && entry.region;
          },
          transformEntry({ entry }) {
            return {
              id: entry.id,
              collection_type: "profiles",
              name: entry.username,
              image: entry.avatar,
              slug: entry.id,
            };
          },
        },
      },
    },
  };
};
