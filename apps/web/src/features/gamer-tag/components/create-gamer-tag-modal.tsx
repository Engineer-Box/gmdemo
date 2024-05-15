import {
  GameSelect,
  useGameSelect,
} from "@/features/game/components/game-select";
import { GamerTagService } from "../gamer-tag-service";
import { useCallback, useEffect, useState } from "react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/button";
import { useGamerTagMutation } from "../hooks/use-gamer-tag-mutation";
import { GamerTagModal } from "./gamer-tag-modal";

const getTemporaryId = () => Date.now() + Math.floor(Math.random() * 1000);

export const CreateGamerTagModal = ({
  isOpen,
  closeModal,
  gameIdsToExclude,
  onSuccess,
  fixedGameId,
}: {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
  gameIdsToExclude?: number[];
  fixedGameId?: number;
}) => {
  const { selectedGame, setSelectedGame, gameSelectError, setGameSelectError } =
    useGameSelect();
  const { mutate, userError, isLoading, reset } = useGamerTagMutation(
    ({ tagName }: { tagName: string }) =>
      GamerTagService.createGamerTag(selectedGame?.id!, tagName),
    {
      getOptimisticGamerTags({ tagName }, gamerTagsInCache) {
        const newGamerTag = {
          id: getTemporaryId(),
          attributes: {
            tag: tagName,
            game: {
              data: selectedGame,
            },
            createdAt: "",
          },
        };
        return [...gamerTagsInCache, newGamerTag];
      },
      successMessage: "Gamer tag created successfully",
      closeModal,
      onSuccess() {
        onSuccess?.();
      },
    }
  );

  const {
    handleSubmit,
    formState,
    register,
    reset: resetFormState,
  } = useForm<{ tagName: string }>();

  const onSubmit = () => {
    if (!selectedGame) {
      setGameSelectError(true);
      return;
    }

    handleSubmit(({ tagName }) => {
      mutate({ tagName });
    })();
  };

  useEffect(() => {
    if (selectedGame) {
      setGameSelectError(false);
    }
  }, [selectedGame]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedGame(null);
      setGameSelectError(false);
      resetFormState();
    }
  }, [isOpen]);

  const errorMessage =
    (gameSelectError && "Please select a game") ||
    (formState.errors["tagName"] && "Please enter a gamer tag") ||
    (userError &&
      (userError === "GamerTagTakenForGame"
        ? "Gamer tag already taken for this game"
        : "Something went wrong"));

  return (
    <GamerTagModal
      closeModal={closeModal}
      isOpen={isOpen}
      isLoading={isLoading}
      title="New Gamer Tag"
      isTagNameInputError={!!formState.errors["tagName"]}
      tagNameInputRegister={register("tagName", { required: true })}
      errorMessage={errorMessage}
      description="Input your gamer tag so that the other team can find you in the game"
      FooterButton={
        <Button
          title="Create"
          variant="primary"
          onClick={() => {
            onSubmit();
          }}
        />
      }
    >
      <div className="flex flex-col gap-2 max-w-80">
        <GameSelect
          fixedGameId={fixedGameId}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
          gameIdsToExclude={gameIdsToExclude}
          gameSelectError={gameSelectError}
        />
      </div>
    </GamerTagModal>
  );
};
