import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import { strapiApi } from "@/lib/strapi";
import { Team, TeamWithoutRelations } from "../team/types";

export enum NOTIFICATION_TYPES {
  TeamInviteReceived = "TEAM_INVITE_RECEIVED",
  TransactionResult = "TRANSACTION_RESULT",
  EnrolledInBattle = "ENROLLED_IN_BATTLE",
  BattleInviteReceived = "BATTLE_INVITE_RECEIVED",
  BattleConfirmed = "BATTLE_CONFIRMED",
  ChallengeInviteDeclined = "CHALLENGE_INVITE_DECLINED",
  Descriptive = "DESCRIPTIVE",
  Redirect = "REDIRECT",
}

type SharedNotificationAttributes<NotifcationType extends NOTIFICATION_TYPES> =
  {
    seen: boolean;
    type: NotifcationType;
  };

export type TeamInviteReceivedNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.TeamInviteReceived> & {
    team: StrapiRelation<
      StrapiEntity<TeamWithoutRelations & Pick<Team, "image">>
    >;
  }
>;

export type TransactionResultNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.TransactionResult> & {
    transaction_result_details: {
      didFail: boolean;
      type: "deposit" | "withdraw";
      amount: number;
    };
  }
>;

export type EnrolledInBattleNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.EnrolledInBattle> & {
    enrolled_in_battle_details: {
      battleId: number;
      teamId: number;
    };
  }
>;
export type BattleInviteReceivedNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.BattleInviteReceived> & {
    battle_invite_received_details: {
      battleId: number;
      invitedTeamId: number;
      invitingTeamId: number;
      invitingTeamName: string;
    };
  }
>;
export type BattleConfirmedNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.BattleConfirmed> & {
    battle_confirmed_details: {
      battleId: number;
      opposingTeamName: string;
      teamId: number;
    };
  }
>;

export type DescriptiveNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.Descriptive> & {
    descriptive_details: {
      title: string;
      image?: null | StrapiImage;
    };
  }
>;

export type ChallengeInviteDeclinedNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.ChallengeInviteDeclined> & {
    challenge_invite_declined_details: {
      decliningTeamName: string;
      teamId: number;
    };
  }
>;

export type RedirectNotificationResponse = StrapiEntity<
  SharedNotificationAttributes<NOTIFICATION_TYPES.Redirect> & {
    redirect_details: {
      path: string;
      title: string;
      image?: StrapiImage;
    };
  }
>;

export const isRedirectNotification = (
  v: unknown
): v is RedirectNotificationResponse => {
  const value = v as RedirectNotificationResponse;
  const isCorrectType = value.attributes.type === NOTIFICATION_TYPES.Redirect;
  const hasTitle =
    typeof value.attributes?.redirect_details?.title === "string";
  const hasPath = typeof value.attributes?.redirect_details?.path === "string";

  return isCorrectType && hasTitle && hasPath;
};

export const isDescriptiveNotification = (
  v: unknown
): v is DescriptiveNotificationResponse => {
  const value = v as DescriptiveNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.Descriptive;
  const hasTitle =
    typeof value.attributes?.descriptive_details?.title === "string";

  return isCorrectType && hasTitle;
};
export const isChallengeInviteDeclinedNotification = (
  v: unknown
): v is ChallengeInviteDeclinedNotificationResponse => {
  const value = v as ChallengeInviteDeclinedNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.ChallengeInviteDeclined;
  const hasDecliningTeamName =
    typeof value.attributes?.challenge_invite_declined_details
      ?.decliningTeamName === "string";
  const hasTeamId =
    typeof value.attributes?.challenge_invite_declined_details?.teamId ===
    "number";

  return isCorrectType && hasDecliningTeamName && hasTeamId;
};

export const isTeamInviteReceivedNotification = (
  v: unknown
): v is TeamInviteReceivedNotificationResponse => {
  const value = v as TeamInviteReceivedNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.TeamInviteReceived;
  const hasLinkedTeam = typeof value.attributes?.team?.data?.id === "number";

  return isCorrectType && hasLinkedTeam;
};

export const isTransactionResultNotification = (
  v: unknown
): v is TransactionResultNotificationResponse => {
  const value = v as TransactionResultNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.TransactionResult;

  const { amount, type, didFail } =
    value.attributes?.transaction_result_details ?? {};

  return (
    isCorrectType &&
    typeof amount === "number" &&
    typeof type === "string" &&
    typeof didFail === "boolean"
  );
};

export const isEnrolledInBattleNotification = (
  v: unknown
): v is EnrolledInBattleNotificationResponse => {
  const value = v as EnrolledInBattleNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.EnrolledInBattle;

  const { battleId, teamId } =
    value.attributes?.enrolled_in_battle_details ?? {};

  return (
    isCorrectType && typeof battleId === "number" && typeof teamId === "number"
  );
};

export const isBattleInviteReceivedNotification = (
  v: unknown
): v is BattleInviteReceivedNotificationResponse => {
  const value = v as BattleInviteReceivedNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.BattleInviteReceived;

  const { battleId, invitedTeamId, invitingTeamId, invitingTeamName } =
    value.attributes?.battle_invite_received_details ?? {};

  return (
    isCorrectType &&
    typeof battleId === "number" &&
    typeof invitedTeamId === "number" &&
    typeof invitingTeamId === "number" &&
    typeof invitingTeamName === "string"
  );
};

export const isBattleConfirmedNotification = (
  v: unknown
): v is BattleConfirmedNotificationResponse => {
  const value = v as BattleConfirmedNotificationResponse;
  const isCorrectType =
    value.attributes.type === NOTIFICATION_TYPES.BattleConfirmed;

  const { battleId, opposingTeamName, teamId } =
    value.attributes?.battle_confirmed_details ?? {};

  return (
    isCorrectType &&
    typeof battleId === "number" &&
    typeof opposingTeamName === "string" &&
    typeof teamId === "number"
  );
};

export type NotificationResponse =
  | TeamInviteReceivedNotificationResponse
  | TransactionResultNotificationResponse
  | EnrolledInBattleNotificationResponse
  | BattleInviteReceivedNotificationResponse
  | BattleConfirmedNotificationResponse
  | ChallengeInviteDeclinedNotificationResponse
  | DescriptiveNotificationResponse
  | RedirectNotificationResponse;

const populate = ["team", "team.image"];

export class NotificationService {
  static async getNotificationsForProfile(profileId: number) {
    const notificationsResponse = await strapiApi.find<NotificationResponse>(
      "notifications",
      {
        populate,
        filters: { profile: profileId },
        pagination: {
          pageSize: 6,
          page: 1,
        },
      }
    );

    return notificationsResponse;
  }

  static async markAsRead(notificationId: number) {
    const deletedNotification = await strapiApi.delete<NotificationResponse>(
      "notifications",
      notificationId,
      {}
    );
    return deletedNotification;
  }

  static async markAllAsSeen(profileId: number) {
    await strapiApi.request("post", `/notifications/mark-all-as-seen`, {
      data: {
        data: {
          profile: profileId,
        },
      },
    });
  }
}
