import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { useToast } from "@/providers/toast-provider";
import { useEffect, useReducer, useRef, useState } from "react";
import { ProfileBio } from "./profile-bio";
import { useStrapiImageUpload } from "@/hooks/use-strapi-image-upload";
import { EditableImagePageSection } from "@/components/editable-image-page-section";
import { TeamsTable } from "./teams-table/teams-table";
import { USER_QUERY_KEY } from "@/constants";
import { Vouch } from "./vouch";
import { updateProfile } from "../../service/update-profile";
import { ProfileResponse } from "../../types";
import { GetProfileWithVouchAndLeaderboardItemStatsResponse } from "../../service/get-profile-with-vouch-and-leaderboard-stats";
import { ProfileStats } from "./profile-stats";
import { ProfileLinks } from "./profile-links";
import { GamerTag } from "@/features/gamer-tag/components/gamer-tag";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";

export const ProfilePageContent = ({
  profile: {
    id,
    attributes: {
      username,
      bio,
      avatar,
      createdAt,
      vouch_count,
      leaderboard_item_stats,
      social_links,
      gamer_tags,
    },
  },
}: {
  profile: GetProfileWithVouchAndLeaderboardItemStatsResponse["data"];
}) => {
  const { user } = useAuth();
  const isOwnProfile = user?.data.profile.id === id;
  const [isEditMode, setIsEditMode] = useState(false);
  const { addToast } = useToast();
  const isDesktop = useTailwindBreakpoint("md");

  const {
    imageUploadState,
    resetUploadState,
    fileObjectUrl,
    onFileInputChange,
  } = useStrapiImageUpload();
  const bioRef = useRef<HTMLParagraphElement>(null);
  const { mutate } = useOptimisticMutation<
    AuthenticatedUser,
    typeof updateProfile
  >(updateProfile, {
    queryKey: USER_QUERY_KEY,
    updateCache(variables, previousValueDraft) {
      if (variables.bio && previousValueDraft) {
        previousValueDraft.data.profile.bio = variables.bio;
      }

      return previousValueDraft;
    },
    onError() {
      addToast({
        type: "error",
        message: "Something went wrong",
      });
    },
    onSuccess() {
      addToast({
        type: "success",
        message: "Profile updated",
      });
    },
  });

  useEffect(() => {
    if (isEditMode) {
      bioRef.current?.focus();
    }
  }, [isEditMode]);

  const onSave = () => {
    if (!isOwnProfile) return;
    if (imageUploadState.status === "uploading") return;
    const text = bioRef.current?.textContent ?? undefined;

    if (text?.length && text.length > 248) {
      let message = "Bio must be less than 248 characters";

      addToast({
        type: "error",
        message,
      });
      throw new Error(message);
    }
    const imageId =
      imageUploadState.status === "complete"
        ? imageUploadState.detail
        : undefined;

    if (isEditMode) {
      const bioDidChange = text && bio !== text;
      const avatarDidChange = imageId && imageId !== avatar?.data?.id;

      mutate({
        profileId: id,
        bio: bioDidChange ? text : undefined,
        avatar: avatarDidChange ? imageId : undefined,
      });
    }

    resetUploadState();
  };

  const playerSince = new Date(createdAt).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div>
      <EditableImagePageSection
        isEditMode={isEditMode}
        initialImage={avatar}
        imageUploadState={imageUploadState}
        fileObjectUrl={fileObjectUrl}
        onFileInputChange={onFileInputChange}
        setIsEditMode={setIsEditMode}
        onSave={onSave}
        showEditButton={isOwnProfile}
        TitleSection={
          <div className="flex gap-4 items-center">
            <Heading
              variant="h1"
              className={
                "mb-0 outline-none cursor-default focus:outline-none overflow-hidden"
              }
            >
              {username}
            </Heading>
            {!isOwnProfile && (
              <Vouch
                profileIdToVouch={id}
                vouchCount={vouch_count ?? 0}
                currentUser={user ?? undefined}
              />
            )}
          </div>
        }
        ContentSection={
          <div className="flex h-full justify-between">
            <div className="flex flex-col h-full">
              <Text variant="p" className="cursor-default">
                Player since {playerSince}
              </Text>
              <ProfileBio isEditMode={isEditMode} bio={bio} bioRef={bioRef} />
              {!isOwnProfile && isDesktop && social_links && (
                <>
                  <div className="mt-4" />
                  <div className="mt-auto">
                    <ProfileLinks links={social_links} />
                  </div>
                </>
              )}
            </div>
            {!isOwnProfile && isDesktop && gamer_tags.data?.length && (
              <div className="flex flex-col gap-2 items-end justify-end">
                {gamer_tags.data.map((gt) => (
                  <GamerTag key={gt.id} tag={gt.attributes.tag} />
                ))}
              </div>
            )}
          </div>
        }
      />
      <ProfileStats stats={leaderboard_item_stats} />
      <TeamsTable profileId={id} />
    </div>
  );
};
