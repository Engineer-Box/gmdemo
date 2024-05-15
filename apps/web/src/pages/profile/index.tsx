import { ErrorPage } from "@/components/error-page";
import { ProfilePageContent } from "@/features/profile/components/profile-page/profile-page-content";
import { ProfilePageSkeleton } from "@/features/profile/components/profile-page/profile-page-skeleton";
import { getProfileWithVouchAndLeaderboardItemStats } from "@/features/profile/service/get-profile-with-vouch-and-leaderboard-stats";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

export default function ProfileIndexPage() {
  const { user, signIn, authStatus } = useAuth();
  const profileId = user?.data.profile.id;

  const { isLoading, data, isError } = useQuery(
    getProfileWithVouchAndLeaderboardItemStats.queryKey(profileId!),
    async () => {
      const profileResponse = await getProfileWithVouchAndLeaderboardItemStats(
        profileId!
      );
      return profileResponse;
    },
    {
      enabled: !!profileId,
    }
  );

  if (isError) {
    return <ErrorPage type="somethingWentWrong" />;
  }

  if (authStatus === "unauthenticated") {
    signIn();
    return null;
  }

  return (
    <div className="relative z-0">
      {(authStatus === "loading" || isLoading) && <ProfilePageSkeleton />}
      {data && <ProfilePageContent profile={data.data} />}
    </div>
  );
}
