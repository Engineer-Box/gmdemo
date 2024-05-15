import { Image } from "@/components/image";
import { SearchDropdown } from "@/components/search-dropdown/search-dropdown";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { useSearchDropdown } from "@/hooks/use-search-dropdown";
import { globalMelilisearchIndex } from "@/lib/meilisearch";
import { StrapiImage } from "@/types/strapi-types";
import { Text } from "@/components/text";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";
import { TeamMemberEditItem } from "./team-member-edit-item";
import { MAX_TEAM_MEMBERS } from "../constants";
import { TeamMemberUpdate, TeamRoles } from "../types";
import { useGlobalModal } from "@/providers/global-modal-provider";
import { TransferOwnershipModal } from "./transfer-ownership-modal";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "@/components/loader";
import { cn } from "@/utils/cn";
import { getPendingResults } from "../service/get-pending-results";

type TeamMemberEdit = {
  teamId?: number;
  teamMemberInvites: TeamMemberUpdate[];
  allowOwnershipTransfer?: boolean;
  setTeamMemberInvites: React.Dispatch<
    React.SetStateAction<TeamMemberUpdate[]>
  >;
};

export const TeamMemberEdit = ({
  teamMemberInvites,
  allowOwnershipTransfer,
  setTeamMemberInvites,
  teamId,
}: TeamMemberEdit) => {
  const { openModal, closeModal } = useGlobalModal();
  const { user } = useAuth();

  const { results, isNoResults, ...searchDropdownProps } = useSearchDropdown(
    "global-profiles",
    async (query) => {
      const searchResult = await globalMelilisearchIndex.search(query, {
        attributesToSearchOn: ["name"],
        limit: 4,
        filter: ["collection_type = profiles"],
        sort: ["name:asc"],
      });

      return searchResult.hits;
    }
  );

  const { data: pendingResults, isInitialLoading: pendingResultsIsLoading } =
    useQuery(
      ["get-pending-results", teamId],
      () => getPendingResults(teamId!),
      {
        enabled:
          !!teamId && teamMemberInvites.length > 0 && allowOwnershipTransfer,
        cacheTime: 1000,
      }
    );

  // Filter any results that are already in the teamMemberInvites
  const filteredResults = results.filter((hits) => {
    const foundItem = teamMemberInvites.find((tmi) => tmi.userId === hits.id);
    return !foundItem;
  });

  const teamProfileOfCurrentUser = teamMemberInvites.find(
    (tmi) => tmi.userId === user?.data.profile.id
  );

  const inviteTeamMember = (
    userId: number,
    username: string,
    image: StrapiImage
  ) => {
    setTeamMemberInvites((prev) => [
      ...prev.filter((tmi) => tmi.userId !== userId),
      {
        userId,
        username,
        role: "member",
        isPending: true,
        image,
      } as TeamMemberUpdate,
    ]);
  };

  const updateTeamMemberRole = (
    userId: number,
    newRole: TeamRoles | "Remove" | "Ownership"
  ) => {
    const teamMemberInvite = teamMemberInvites.find(
      (tmi) => tmi.userId === userId
    );
    if (!teamMemberInvite) return;

    if (newRole === "Remove") {
      setTeamMemberInvites(
        teamMemberInvites.filter((tmi) => tmi.userId !== userId)
      );
    } else if (newRole === "Ownership") {
      openModal(
        <TransferOwnershipModal
          closeModal={closeModal}
          onConfirm={() => {
            // Set the current founder to a leader
            const currentFounder = teamMemberInvites.find(
              (tmi) => tmi.role === "founder"
            )!;
            currentFounder.role = "leader";

            // Set the new user to a founder
            teamMemberInvite.role = "founder";
            setTeamMemberInvites([...teamMemberInvites]);
            closeModal();
          }}
        />,
        {
          isClosable: true,
        }
      );
    } else {
      teamMemberInvite.role = newRole;
      setTeamMemberInvites([...teamMemberInvites]);
    }
  };

  return (
    <div className="relative z-0">
      <SearchDropdown
        disabled={MAX_TEAM_MEMBERS === teamMemberInvites.length}
        renderItem={({ name, image }) => (
          <div className="flex items-center gap-3">
            <div className="w-[30px] h-[30px] relative rounded-sm overflow-hidden">
              <Image alt={name} src={resolveStrapiImage(image)} />
            </div>
            <Text className={"text-brand-white"}>{name}</Text>
          </div>
        )}
        inputClassName="bg-brand-navy"
        dropdownContainerClassName="bg-brand-navy"
        NoItemsFound={
          <Text className={"text-brand-white"}>No players found</Text>
        }
        placeholder="Search for a player"
        ItemSkeleton={
          <div className="flex items-center gap-3">
            <Icon
              icon="image"
              size={30}
              className="text-brand-navy-light animate-pulse"
            />
            <Skeleton className="w-full h-3" />
          </div>
        }
        onResultClick={(result) => {
          searchDropdownProps.setQuery("");
          inviteTeamMember(result.id, result.name, result.image);
        }}
        isNoResults={isNoResults}
        results={filteredResults}
        {...searchDropdownProps}
      />

      <div
        className={cn(
          "relative flex flex-col gap-4 mt-4 -z-20",
          pendingResultsIsLoading && "gap-2"
        )}
      >
        <Loader
          isLoading={pendingResultsIsLoading}
          Loading={
            <>
              <div className="flex gap-2 items-center">
                <Skeleton type="image" className="w-8" />
                <Skeleton dark className="w-full h-4" />
              </div>
              <div className="flex gap-2 items-center">
                <Skeleton type="image" className="w-8" />
                <Skeleton dark className="w-full h-4" />
              </div>
              <div className="flex gap-2 items-center">
                <Skeleton type="image" className="w-8" />
                <Skeleton dark className="w-full h-4" />
              </div>
            </>
          }
        >
          {teamMemberInvites.map((teamMemberInvite) => (
            <TeamMemberEditItem
              key={teamMemberInvite.userId}
              {...teamMemberInvite}
              disabled={
                user?.data.profile.id === teamMemberInvite.userId ||
                teamProfileOfCurrentUser?.role !== "founder" ||
                (pendingResults?.hasPendingResults &&
                  pendingResults.participatingProfileIds.includes(
                    teamMemberInvite.userId
                  ))
              }
              allowOwnershipTransfer={
                allowOwnershipTransfer &&
                teamMemberInvites.find(
                  (tmi) => tmi.userId === user?.data.profile.id
                )?.role === "founder" &&
                teamMemberInvite.isPending === false
              }
              setRole={(role) => {
                updateTeamMemberRole(teamMemberInvite.userId, role);
              }}
            />
          ))}
        </Loader>
      </div>
    </div>
  );
};
