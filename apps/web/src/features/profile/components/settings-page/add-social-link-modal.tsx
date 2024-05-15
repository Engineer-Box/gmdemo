import { Button } from "@/components/button";
import { Modal } from "@/components/modal/modal";
import { Select } from "@/components/select";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { TextInput } from "@/components/text-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/text";
import { USER_QUERY_KEY } from "@/constants";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { produce } from "immer";
import { useToast } from "@/providers/toast-provider";
import { toPascalCase } from "@/utils/to-pascal-case";
import { addSocialLink } from "../../service/add-social-link";
import { Profile, SocialLinksComponent } from "../../types";

type addSocialLinkModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  profileId: number;
  socialLinks: Profile["social_links"];
};

type FormInputs = { value: string; platform: keyof SocialLinksComponent };

const getPlaceholder = (platform: keyof SocialLinksComponent) => {
  if (platform === "twitter") {
    return "Twitter handle";
  }

  if (platform === "twitch") {
    return "Twitch channel name";
  }

  if (platform === "youtube") {
    return "Youtube handle";
  }
  return "Discord user ID";
};

export const AddSocialLinkModal = ({
  isOpen,
  closeModal,
  profileId,
  socialLinks,
}: addSocialLinkModalProps) => {
  const { addToast } = useToast();
  const {
    handleSubmit,
    formState,
    register,
    control,
    watch,
    setValue,
    resetField,
    reset: resetFormState,
  } = useForm<FormInputs>();

  const selectedPlatform = watch("platform");
  const queryClient = useQueryClient();
  const { mutate: addSocialLinkMutation } = useMutation(
    (formValues: FormInputs) =>
      addSocialLink(profileId, formValues.platform, formValues.value),
    {
      async onMutate(variables) {
        closeModal();
        await queryClient.cancelQueries(USER_QUERY_KEY);
        const previousCacheValue =
          queryClient.getQueryData<AuthenticatedUser>(USER_QUERY_KEY);

        const optimisticValue = produce(previousCacheValue, (draft) => {
          if (!draft) {
            return draft;
          }
          if (draft?.data.profile.social_links) {
            draft.data.profile.social_links[variables.platform] =
              variables.value;
          } else {
            draft.data.profile.social_links = {
              discord: null,
              twitter: null,
              twitch: null,
              youtube: null,
              [variables.platform]: variables.value,
            };
          }
          return draft;
        });
        queryClient.setQueryData(USER_QUERY_KEY, optimisticValue);

        return { previousCacheValue };
      },
      onSuccess() {
        // show a success toast
        addToast({
          type: "success",
          message: "Social link added",
        });
      },
      onError(err, variables, context) {
        // show an error toast
        addToast({
          type: "error",
          message: "Failed to add social link",
        });
        // undo the cache changes
        queryClient.setQueriesData(USER_QUERY_KEY, context?.previousCacheValue);
      },
      onSettled() {
        queryClient.invalidateQueries(USER_QUERY_KEY);
      },
    }
  );

  useEffect(() => {
    if (selectedPlatform) {
      resetField("value");
    }
  }, [selectedPlatform]);

  const disabledOptions = useMemo(
    () =>
      socialLinks
        ? Object.keys(socialLinks).filter(
            (key) => socialLinks[key as keyof typeof socialLinks] !== null
          )
        : [],
    [socialLinks]
  );

  const onSubmit: SubmitHandler<FormInputs> = (formValues) => {
    addSocialLinkMutation(formValues);
  };

  const platformError = formState.errors.platform?.message;
  const valueError = formState.errors.value?.message;
  const shouldShowAtIcon =
    selectedPlatform === "twitter" || selectedPlatform === "youtube";

  return (
    <div>
      <Modal
        title="Add social link"
        isOpen={isOpen}
        closeModal={closeModal}
        isClosable
        size={"sm"}
        Footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" title="Cancel" onClick={closeModal} />
            <Button title="Add" onClick={handleSubmit(onSubmit)} />
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <Controller
            name="platform"
            control={control}
            defaultValue={undefined}
            rules={{ required: "Social platform is required" }}
            render={({ field }) => (
              <Select
                value={field.value}
                setValue={field.onChange}
                options={["discord", "twitter", "twitch", "youtube"]}
                error={!!formState.errors.platform}
                getLabel={toPascalCase}
                disabledOptions={disabledOptions}
              />
            )}
          />
          <TextInput
            disabled={!selectedPlatform}
            placeholder={selectedPlatform && getPlaceholder(selectedPlatform)}
            icon={shouldShowAtIcon ? "at" : undefined}
            error={!platformError && !!valueError}
            {...register("value", {
              required: "Please enter a value",
              validate: {
                noUrl: (input) =>
                  !/(https?:\/\/[^\s]+)/g.test(input) || "URLs are not allowed",
                noSpaces: (input) =>
                  !/\s/g.test(input) || "Spaces are not allowed",
                noAtStart: (input) =>
                  !input.startsWith("@") || "Cannot start with @",
              },
            })}
          />
          {(platformError || valueError) && (
            <Text className={"text-brand-status-error font-semibold"}>
              {platformError || valueError}
            </Text>
          )}
        </div>
      </Modal>
    </div>
  );
};
