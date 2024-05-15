import { ethers } from "ethers";
import { processTransactions } from "../src/process-transactions";

export const cronTasks = {
  processTransactions: {
    async task() {
      console.log("processTransactions CRON");
      await processTransactions();
    },
    options: {
      rule: "* * * * *",
    },
  },
  handleUnresolvedBattles: {
    async task() {
      console.log("handleUnresolvedBattles CRON");
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const battleMatches = await strapi.db.query("api::match.match").findMany({
        populate: {
          dispute: true,
          battle: true,
        },
        where: {
          $and: [
            {
              result: {
                $null: true,
              },
            },
            {
              dispute: {
                id: {
                  $null: true,
                },
              },
            },
            {
              battle: {
                id: {
                  $notNull: true,
                },
              },
            },
            {
              last_vote_date: {
                $lt: twentyFourHoursAgo.toISOString(),
              },
            },
          ],
        },
      });

      // Find which team voted and take theirs as the result
      await Promise.all(
        battleMatches.map(async (match) => {
          // TODO: Needs updating for tournaments
          const homeTeamVote = match.home_team_vote;
          const awayTeamVote = match.away_team_vote;

          if (homeTeamVote && awayTeamVote) {
            return;
          }
          await strapi
            .service("api::battle.battle")
            .completeBattle(match.battle.id, homeTeamVote ?? awayTeamVote);
        }),
      );
    },

    options: {
      rule: "* * * * *",
    },
  },
  battleExpiryJob: {
    async task() {
      console.log("battleExpiryJob CRON");
      const battlesToCancel = await strapi.db
        .query("api::battle.battle")
        .findMany({
          populate: {
            match: {
              populate: {
                home_team: {
                  populate: {
                    team: {
                      populate: {
                        image: true,
                      },
                    },
                    team_selection_profiles: {
                      populate: {
                        team_profile: {
                          populate: {
                            profile: true,
                          },
                        },
                      },
                    },
                  },
                },
                away_team: {
                  populate: {
                    team: true,
                  },
                },
              },
            },
          },
          where: {
            $and: [
              {
                match: {
                  away_team: { id: { $null: true } },
                },
              },
              {
                date: { $lt: new Date().toISOString() },
              },
              {
                is_cancelled: { $eq: false },
              },
            ],
          },
        });

      await Promise.all(
        (battlesToCancel ?? []).map(async (battle) => {
          await strapi.service("api::battle.battle").cancelBattle(battle.id);

          try {
            const battleCreatorTeamSelectionProfile =
              battle.match.home_team.team_selection_profiles.find(
                (tsp) => tsp.is_captain,
              );

            const profileId =
              battleCreatorTeamSelectionProfile.team_profile.profile.id;

            await strapi
              .service("api::notification.notification")
              .createDescriptiveNotification(profileId, {
                title: `The battle for ${battle.match.home_team.team.name} has expired`,
                image: battle.match.home_team.team.image,
              });
          } catch (error) {}
        }),
      );
    },
    options: {
      rule: "* * * * *",
    },
  },
  notificationExpiryJob: {
    async task() {
      console.log("notificationExpiryJob CRON");
      const now = new Date();
      // get the ISO string for the 24 hours ago, if the createdAt is less than this (lower than this), then it's expired
      const expiredThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await strapi.db.query("api::notification.notification").deleteMany({
        where: {
          createdAt: {
            $lt: expiredThreshold.toISOString(),
          },
        },
      });
    },
    options: {
      rule: "*/15 * * * * *",
    },
  },
  inviteExpiryJob: {
    async task({ strapi }) {
      console.log("inviteExpiryJob CRON");
      const now = new Date();
      const expiredThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Note that we can't use deleteMany here because there is a delete hook for the team profile that deletes the notification
      const { results: expiredInvites } = await strapi.services[
        "api::team-profile.team-profile"
      ].find({
        pagination: {
          pageSize: 250,
        },
        filters: {
          $and: [
            {
              is_pending: true,
            },

            {
              createdAt: {
                $lt: expiredThreshold.toISOString(),
              },
            },
          ],
        },
      });

      await Promise.all(
        expiredInvites.map(async ({ id }) => {
          await strapi.service("api::team-profile.team-profile").delete(id);
        }),
      );
    },
    options: {
      rule: "*/15 * * * * *",
    },
  },
};
