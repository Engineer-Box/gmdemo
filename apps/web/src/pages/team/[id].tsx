import { ErrorPage } from "@/components/error-page";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { TeamPageContent } from "@/features/team/components/team-page-content";
import { TeamPageSkeleton } from "@/features/team/components/team-page-skeleton";
import { getTeam } from "@/features/team/service/get-team";
import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function TeamIdPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isUserLoading } = useAuth();
  const teamId =
    typeof id === "string" ? parseInt(id.replace(/\D/g, "")) : null;

  const {
    isLoading: isTeamLoading,
    data: teamData,
    isError: isTeamError,
    error,
    isLoadingError,
  } = useQuery(["team", teamId], async () => getTeam(teamId!), {
    retry: false,
    enabled: !!teamId,
  });

  if (isTeamError || teamData?.data.attributes.deleted) {
    return <ErrorPage type="notFound" />;
  }

  return (
    <div className="relative z-0">
      {(isTeamLoading || isUserLoading) && <TeamPageSkeleton />}
      {teamData?.data && (
        <TeamPageContent
          team={teamData.data}
          teamProfile={getTeamProfileForUserBy("teamId", teamId!, user)}
        />
      )}
    </div>
  );
}
