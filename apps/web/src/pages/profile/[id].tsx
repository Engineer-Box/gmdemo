import { ErrorPage } from "@/components/error-page";
import { ProfilePageContent } from "@/features/profile/components/profile-page/profile-page-content";
import { ProfilePageSkeleton } from "@/features/profile/components/profile-page/profile-page-skeleton";
import { getProfile } from "@/features/profile/service/get-profile";
import { getProfileWithVouchAndLeaderboardItemStats } from "@/features/profile/service/get-profile-with-vouch-and-leaderboard-stats";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function ProfileIdPage() {
  const router = useRouter();
  const { id } = router.query;
  const profileId =
    typeof id === "string" ? parseInt(id.replace(/\D/g, "")) : null;

  const { isLoading, data, isError } = useQuery(
    getProfileWithVouchAndLeaderboardItemStats.queryKey(profileId!),
    async () => {
      const profileResponse = await getProfileWithVouchAndLeaderboardItemStats(
        profileId!
      );
      return profileResponse;
    },
    {
      retry: false,
      enabled: !!profileId,
    }
  );

  if (isError) {
    return <ErrorPage type="notFound" />;
  }

  return (
    <div className="relative z-0">
      {isLoading && <ProfilePageSkeleton />}
      {data && <ProfilePageContent profile={data.data} />}
    </div>
  );
}
