/**
 * notification service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::notification.notification", {
  async createTeamInviteReceivedNotification(teamId, profileId) {
    throw new Error("Not implemented");
  },

  async createRedirectNotification(
    profileId: number,
    details: {
      title: string;
      path: string;
      image: any;
    },
  ) {
    await super.create({
      data: {
        type: "REDIRECT",
        profile: profileId,
        redirect_details: details,
      },
    });
  },
  async createDescriptiveNotification(
    profileId: number,
    details: {
      title: string;
      image?: any;
    },
  ) {
    await super.create({
      data: {
        type: "DESCRIPTIVE",
        profile: profileId,
        descriptive_details: details,
      },
    });
  },

  async createChallengeInviteDeclinedNotification(
    profileId: number,
    decliningTeamName: string,
    teamId: number,
  ) {
    await super.create({
      data: {
        type: "CHALLENGE_INVITE_DECLINED",
        profile: profileId,
        challenge_invite_declined_details: {
          decliningTeamName,
          teamId,
        },
      },
    });
  },
  async createBattleConfirmedNotification(battleId: number) {
    const battle = await strapi
      .service("api::battle.battle")
      .findOne(battleId, {
        populate: {
          match: {
            populate: {
              home_team: {
                populate: {
                  team: true,
                  team_profiles: {
                    populate: {
                      profile: true,
                    },
                  },
                },
              },
              away_team: {
                populate: {
                  team: true,
                  team_profiles: {
                    populate: {
                      profile: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    await Promise.all(
      battle.match.home_team.team_profiles.map((teamProfile) =>
        super.create({
          data: {
            type: "BATTLE_CONFIRMED",
            profile: teamProfile.profile.id,
            battle_confirmed_details: {
              battleId,
              teamId: battle.match.home_team.team.id,
              opposingTeamName: battle.match.away_team.team.name,
            },
          },
        }),
      ),
    );

    await Promise.all(
      battle.match.away_team.team_profiles.map((teamProfile) =>
        super.create({
          data: {
            type: "BATTLE_CONFIRMED",
            profile: teamProfile.profile.id,
            battle_confirmed_details: {
              battleId,
              teamId: battle.match.away_team.team.id,
              opposingTeamName: battle.match.home_team.team.name,
            },
          },
        }),
      ),
    );
  },
  async createTransactionResultNotification(
    profileId,
    transactionResultDetails,
  ) {
    throw new Error("Not implemented");
  },
  async createBattleInviteReceivedNotifications({
    battleId,
    invitingTeamId,
    invitedTeamId,
  }: {
    battleId: number;
    invitingTeamId: number;
    invitedTeamId: number;
  }) {
    const invitingTeam = await strapi
      .service("api::team.team")
      .findOne(invitingTeamId);

    const invitedTeam = await strapi
      .service("api::team.team")
      .findOne(invitedTeamId, {
        populate: {
          image: true,
          team_profiles: {
            populate: {
              profile: true,
            },
            filters: {
              deleted: { $ne: true },
              role: {
                $in: ["founder", "leader"],
              },
            },
          },
        },
      });

    const profilesToNotify =
      invitedTeam?.team_profiles?.map((tp) => tp.profile.id) ?? [];

    const battleInviteReceivedNotifications = profilesToNotify.map(
      (profileId) => ({
        type: "BATTLE_INVITE_RECEIVED",
        profile: profileId,
        battle_invite_received_details: {
          battleId,
          invitedTeamId,
          invitingTeamId,
          invitingTeamName: invitingTeam?.name,
        },
      }),
    );

    await Promise.all(
      battleInviteReceivedNotifications.map((n) =>
        super.create({
          data: n,
        }),
      ),
    );
  },
  async createEnrolledInBattleNotification({
    battleId,
    teamSelectionId,
  }: {
    battleId: number;
    teamSelectionId: number;
  }) {
    const teamSelection = await strapi
      .service("api::team-selection.team-selection")
      .findOne(teamSelectionId, {
        populate: {
          team_selection_profiles: {
            filters: {
              is_captain: {
                $eq: false,
              },
            },
            populate: {
              team_profile: {
                populate: {
                  team: true,
                  profile: true,
                },
              },
            },
          },
        },
      });

    // team_selection_profiles;
    const profilesToNotify =
      teamSelection?.team_selection_profiles
        ?.map(
          (teamSelectionProfile) =>
            teamSelectionProfile?.team_profile?.profile.id,
        )
        .filter(Boolean) ?? [];

    if (profilesToNotify.length === 0) return;

    const team = teamSelection.team_selection_profiles[0].team_profile.team;

    const enrolledInBattleNotifications = profilesToNotify.map((profileId) => ({
      type: "ENROLLED_IN_BATTLE",
      profile: profileId,
      enrolled_in_battle_details: {
        battleId,
        teamId: team.id,
      },
    }));

    await Promise.all(
      enrolledInBattleNotifications.map((n) => super.create({ data: n })),
    );
  },
});
