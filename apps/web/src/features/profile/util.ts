import { AuthenticatedUser } from "@/hooks/use-auth";

export const getTeamProfileForUserBy = (
  by: "teamProfileId" | "teamId" | "gameId",
  id: number,
  user?: AuthenticatedUser | null
) => {
  if (!user || !user.data.profile.team_profiles.data) return null;

  const teamProfiles = user.data.profile.team_profiles.data;

  let teamProfile;

  if (by === "teamProfileId") {
    teamProfile = teamProfiles.find((tp) => tp.id === id);
  }

  if (by === "teamId") {
    teamProfile = teamProfiles.find((tp) => tp.attributes.team.data?.id === id);
  }

  if (by === "gameId") {
    teamProfile = teamProfiles.find(
      (tp) => tp.attributes.team.data?.attributes.game.data?.id === id
    );
  }

  return teamProfile ?? null;
};
