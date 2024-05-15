import { Modal } from "@/components/modal/modal";
import { toPascalCase } from "@/utils/to-pascal-case";
import { Button } from "@/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/providers/toast-provider";
import { USER_QUERY_KEY } from "@/constants";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { produce } from "immer";
import { removeSocialLink } from "../../service/remove-social-link";
import { SocialLinksComponent } from "../../types";

type RemoveSocialLinkModalProps = {
  platformToRemove: keyof SocialLinksComponent | null;
  closeModal: () => void;
  profileId: number;
};
export const RemoveSocialLinkModal = ({
  platformToRemove,
  closeModal,
  profileId,
}: RemoveSocialLinkModalProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    () => removeSocialLink(profileId, platformToRemove!),
    {
      onMutate() {
        queryClient.cancelQueries(USER_QUERY_KEY);

        const previousCacheValue =
          queryClient.getQueryData<AuthenticatedUser>(USER_QUERY_KEY);

        const optimisticValue = produce(previousCacheValue, (draft) => {
          if (draft?.data.profile.social_links) {
            draft.data.profile.social_links[platformToRemove!] = null;
          }
          return draft;
        });

        queryClient.setQueryData(USER_QUERY_KEY, optimisticValue);

        return { previousCacheValue };
      },
      onError(error, variables, context) {
        queryClient.setQueriesData(USER_QUERY_KEY, context?.previousCacheValue);
        addToast({
          type: "error",
          message: "Something went wrong",
        });
      },
      onSuccess() {
        addToast({
          type: "success",
          message: "Successfully removed social link",
        });
      },
      onSettled() {
        closeModal();
        queryClient.invalidateQueries(USER_QUERY_KEY);
      },
    }
  );

  return (
    <Modal
      title="Are you sure?"
      isOpen={!!platformToRemove}
      description={
        platformToRemove
          ? `You are about to remove the social link to ${toPascalCase(
              platformToRemove
            )}`
          : undefined
      }
      closeModal={closeModal}
      isClosable
      size={"sm"}
      Footer={
        <div className="flex justify-end gap-4">
          <Button title="Cancel" variant={"secondary"} onClick={closeModal} />
          <Button title="Remove" variant={"delete"} onClick={mutate} />
        </div>
      }
    />
  );
};
