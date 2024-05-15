import { Skeleton } from "@/components/skeleton";
import { SettingsPageContent } from "@/features/profile/components/settings-page/settings-page-content";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user, authStatus, signIn } = useAuth();

  if (authStatus === "unauthenticated") {
    signIn();
    return null;
  }

  return (
    <div>
      {authStatus === "loading" && <Skeleton className="w-full h-[300px]" />}
      {authStatus === "authenticated" && <SettingsPageContent user={user!} />}
    </div>
  );
}
