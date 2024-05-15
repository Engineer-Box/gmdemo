import { useForm } from "react-hook-form";
import { GamerTagSettingsProps } from "./gamer-tag-settings";
import { useToast } from "@/providers/toast-provider";
import { useEffect, useState } from "react";
import { useGamerTagMutation } from "../hooks/use-gamer-tag-mutation";
import { GamerTagService } from "../gamer-tag-service";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button";
import { GamerTagGameLabel } from "./gamer-tag-game-label";
import { GamerTagModal } from "./gamer-tag-modal";

type EditGamerTagModalProps = {
  gamerTag:
    | NonNullable<GamerTagSettingsProps["gamerTags"]["data"]>[number]
    | null;
  closeModal: () => void;
};

export const EditGamerTagModal = ({
  gamerTag,
  closeModal,
}: EditGamerTagModalProps) => {
  const {
    register,
    setValue,
    watch,
    reset: resetFormState,
  } = useForm<{ tagName: string }>();
  const { addToast } = useToast();
  const [isTagNameTakenError, setIsTagNameTakenError] = useState(false);
  const [isRemoveConfirmationModalOpen, setIsRemoveConfirmationModalOpen] =
    useState(false);
  const tagName = watch("tagName");

  const {
    mutate: editGamerTag,
    isLoading: editGamerTagIsLoading,
    reset: editGamerTagReset,
  } = useGamerTagMutation(
    () => GamerTagService.updateGamerTag(gamerTag?.id!, tagName),
    {
      successMessage: "Gamer tag updated successfully",
      closeModal,
      getOptimisticGamerTags(variables, gamerTagsInCache) {
        const gamerTagInCache = gamerTagsInCache.find(
          (tag) => tag.id === gamerTag?.id
        );

        if (gamerTagInCache) {
          const updatedGamerTag = {
            ...gamerTagInCache,
            attributes: {
              ...gamerTagInCache.attributes,
              tag: tagName,
            },
          };

          return [
            ...gamerTagsInCache.filter((tag) => tag.id !== gamerTag?.id),
            updatedGamerTag,
          ];
        }

        return gamerTagsInCache;
      },
      onUserError: (error) => {
        if (error === "GamerTagTakenForGame") {
          setIsTagNameTakenError(true);
        }
        if (error === "PendingResultsForGame") {
          addToast({
            message:
              "Cannot update gamer tag if you have pending results for the game",
            type: "error",
          });
          closeModal();
        }
      },
    }
  );

  const {
    mutate: deleteGamerTag,
    isLoading: deleteGamerTagIsLoading,
    userError: deleteGamerTagUserError,
    reset: deleteGamerTagReset,
  } = useGamerTagMutation(GamerTagService.deleteGamerTag, {
    successMessage: "Gamer tag removed successfully",
    closeModal,
    getOptimisticGamerTags(variables, gamerTagsInCache) {
      return gamerTagsInCache.filter((tag) => tag.id !== gamerTag?.id);
    },
    onUserError(error) {
      if (error === "GamerTagRequiredIfInTeamForGame") {
        setValue("tagName", gamerTag?.attributes.tag ?? "");

        addToast({
          message: "Cannot remove gamer tag if you are in a team for that game",
          type: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (gamerTag) {
      setValue("tagName", gamerTag.attributes.tag);
    }

    return () => {
      resetFormState();
      editGamerTagReset();
      deleteGamerTagReset();
      setIsTagNameTakenError(false);
    };
  }, [!!gamerTag]);

  useEffect(() => {
    setIsTagNameTakenError(false);
  }, [tagName]);

  const onUpdateClick = () => {
    if (gamerTag?.attributes.tag !== tagName) {
      editGamerTag(undefined);
    } else {
      closeModal();
    }
  };

  return (
    <>
      <Modal
        isOpen={isRemoveConfirmationModalOpen}
        closeModal={() => setIsRemoveConfirmationModalOpen(false)}
        title="Are you sure?"
        description="Are you sure you want to remove this gamer tag? Once removed, someone else can claim it."
        isClosable
        Footer={
          <div className="flex justify-end gap-3">
            <Button
              title="Cancel"
              variant={"secondary"}
              onClick={() => setIsRemoveConfirmationModalOpen(false)}
            />
            <Button
              title="Yes, remove"
              variant="delete"
              onClick={() => {
                deleteGamerTag(gamerTag?.id!);
                setIsRemoveConfirmationModalOpen(false);
              }}
            />
          </div>
        }
      />

      <GamerTagModal
        isOpen={!!gamerTag}
        title="Edit Gamer Tag"
        closeModal={closeModal}
        isLoading={editGamerTagIsLoading || deleteGamerTagIsLoading}
        tagNameInputRegister={register("tagName")}
        isTagNameInputError={isTagNameTakenError}
        errorMessage={
          isTagNameTakenError
            ? "Gamer tag already taken for this game"
            : undefined
        }
        FooterButton={
          tagName?.length > 0 ? (
            <Button title="Update" onClick={onUpdateClick} />
          ) : (
            <Button
              disabled={
                deleteGamerTagUserError === "GamerTagRequiredIfInTeamForGame"
              }
              title="Remove"
              variant={"delete"}
              onClick={() => setIsRemoveConfirmationModalOpen(true)}
            />
          )
        }
      >
        {gamerTag && <GamerTagGameLabel game={gamerTag.attributes.game} />}
      </GamerTagModal>
    </>
  );
};
