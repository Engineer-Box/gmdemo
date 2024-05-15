import { Button } from "@/components/button";
import { Image } from "@/components/image";
import { ImageInput } from "@/components/image-input";
import { TextInput } from "@/components/text-input";
import { useStrapiImageUpload } from "@/hooks/use-strapi-image-upload";
import { UseFormReturn } from "react-hook-form";
import { validateTeamName } from "../../util";
import {
  GameSelect,
  GameSelectProps,
} from "@/features/game/components/game-select";

type ContentProps = Omit<
  ReturnType<typeof useStrapiImageUpload>,
  "resetFileState" | "resetUploadState"
> &
  Pick<
    UseFormReturn<{ teamName: string }>,
    | "handleSubmit"
    | "register"
    | "reset"
    | "getValues"
    | "setError"
    | "formState"
  > &
  Pick<
    GameSelectProps,
    | "setSelectedGame"
    | "isDisabled"
    | "gameIdsToExclude"
    | "gameSelectError"
    | "selectedGame"
    | "fixedGameId"
  >;

type FooterProps = {
  onSubmit: () => void;
  closeModal: () => void;
} & Pick<ReturnType<typeof useStrapiImageUpload>, "imageUploadState">;

const Content = ({
  fileObjectUrl,
  onFileInputChange,
  register,
  formState: { errors },
  setSelectedGame,
  gameIdsToExclude,
  selectedGame,
  gameSelectError,
  fixedGameId,
}: ContentProps) => {
  return (
    <div className="relative z-0">
      <div className="grid items-start max-w-[320px] grid-cols-1 gap-3 auto-rows-fr">
        <div className="flex items-center w-full gap-3">
          <div className="relative overflow-hidden rounded cursor-pointer w-11 h-11 aspect-square">
            <Image
              src={fileObjectUrl ?? "/image-placeholder.jpg"}
              alt="team image"
            />
            <ImageInput
              onChange={onFileInputChange}
              className="absolute inset-0 opacity-0 cursor-pointer file:cursor-pointer"
            />
          </div>
          <div className="grow">
            <TextInput
              error={!!errors["teamName"]}
              {...register("teamName", {
                validate: validateTeamName,
              })}
            />
          </div>
        </div>
        <div className="">
          <GameSelect
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            gameIdsToExclude={gameIdsToExclude}
            gameSelectError={!!gameSelectError}
            fixedGameId={fixedGameId}
          />
        </div>
      </div>
      {(gameSelectError || errors.teamName) && (
        <span className="inline-block mt-4 text-brand-status-error">
          {errors.teamName?.message ? errors.teamName.message : gameSelectError}
        </span>
      )}
    </div>
  );
};

const Footer = ({ onSubmit, closeModal, imageUploadState }: FooterProps) => {
  return (
    <>
      <Button variant="secondary" title="Cancel" onClick={closeModal} />
      <Button
        variant="primary"
        title="Continue"
        disabled={imageUploadState.status === "uploading"}
        onClick={onSubmit}
      />
    </>
  );
};

export const CreateTeamModalStep = {
  Content,
  Footer,
};
