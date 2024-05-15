import { AuthenticatedUser } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import { CreateGamerTagModal } from "./create-gamer-tag-modal";
import { Heading } from "@/components/heading";
import { IconButton } from "@/components/icon-button";
import { GamerTagEditRow } from "./gamer-tag-edit-row";
import { EditGamerTagModal } from "./edit-gamer-tag-modal";
import { useGameSelect } from "@/features/game/components/game-select";
import { SubSettingLayout } from "@/features/profile/components/settings-page/sub-setting-layout";

export type GamerTagSettingsProps = {
  gamerTags: AuthenticatedUser["data"]["profile"]["gamer_tags"];
};

export const GamerTagSettings = ({ gamerTags }: GamerTagSettingsProps) => {
  const [isCreateGamerTagModalOpen, setIsCreateGamerTagModalOpen] =
    useState(false);
  const gameSelectProps = useGameSelect();
  const [editGamerTag, setEditGamerTag] = useState<
    NonNullable<GamerTagSettingsProps["gamerTags"]["data"]>[number] | null
  >(null);
  const gameIdsUserHasGamerTagsFor = useMemo(
    () =>
      (gamerTags?.data
        ?.map((gamerTag) => gamerTag.attributes.game.data?.id)
        .filter(Boolean) as number[]) ?? [],
    [gamerTags]
  );

  return (
    <div>
      <CreateGamerTagModal
        isOpen={isCreateGamerTagModalOpen}
        closeModal={() => setIsCreateGamerTagModalOpen(false)}
        gameIdsToExclude={gameIdsUserHasGamerTagsFor}
        {...gameSelectProps}
      />
      <EditGamerTagModal
        closeModal={() => setEditGamerTag(null)}
        gamerTag={editGamerTag}
      />

      <div>
        <SubSettingLayout
          title="Gamer tags"
          onClick={() => setIsCreateGamerTagModalOpen(true)}
        >
          {gamerTags?.data?.map((gamerTag) => (
            <div key={gamerTag.id}>
              <GamerTagEditRow
                onEditClick={() => {
                  setEditGamerTag(gamerTag);
                }}
                gamerTag={gamerTag}
              />
            </div>
          ))}
        </SubSettingLayout>
      </div>
    </div>
  );
};
