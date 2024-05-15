import { profanity } from "@2toad/profanity";
import { TeamMemberUpdate, TeamResponse } from "./types";

export const validateTeamName = (teamName: string) => {
  const teamNameLength = teamName.length;

  const isTooLong = teamNameLength > 32;
  const isTooShort = teamNameLength < 3;
  const doesContainProfanity = profanity.exists(teamName);

  if (teamNameLength === 0) {
    return "Team name is required";
  }

  if (isTooLong) {
    return "Team name is too long";
  }

  if (isTooShort) {
    return "Team name is too short";
  }

  if (doesContainProfanity) {
    return "Team name contains profanity";
  }
};

export const createFakeTeamProfile = (
  val: TeamMemberUpdate
): NonNullable<TeamResponse["attributes"]["team_profiles"]["data"]>[0] => ({
  id: 0,
  attributes: {
    createdAt: "",
    is_pending: true,
    role: val.role,
    avatar: { data: null },
    xp: 0,
    earnings: 0,
    rank: 0,
    gamer_tag: {
      data: {
        id: 0,
        attributes: {
          tag: "",
          createdAt: "",
        },
      },
    },
    profile: {
      data: {
        id: 0,
        attributes: {
          suspended: false,
          wallet_address: "",
          region: "North America",
          username: val.username,
          wager_mode: false,
          trust_mode: false,
          bio: "",
          balance: 0,
          avatar: null,
          createdAt: "",
        },
      },
    },
    invited_by: undefined as never,
  },
});
