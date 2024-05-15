import { Modal } from "@/components/modal/modal";
import * as RadioGroupPrimitives from "@radix-ui/react-radio-group";
import { Badge } from "@/components/badge";
import { HomeOrAway } from "../../types";
import { GetBattleResponse, getBattle } from "../../service/get-battle";
import { useState } from "react";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { Image } from "@/components/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportScore } from "../../service/report-score";
import { useToast } from "@/providers/toast-provider";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { USER_QUERY_KEY } from "@/constants";
import { CreateDisputeModal } from "./create-dispute-modal";

export const ReportScoreModal = ({
  isOpen,
  closeModal,
  match,
  battleId,
  reportersSide,
}: {
  isOpen: boolean;
  closeModal: () => void;
  reportersSide: HomeOrAway;
  battleId: number;
  match: GetBattleResponse["attributes"]["match"];
}) => {
  const [value, setValue] = useState<HomeOrAway | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const homeTeam = match.data.attributes.home_team;
  const awayTeam = match.data.attributes.away_team;
  const reportedWinner = value
    ? value === "home"
      ? homeTeam
      : awayTeam
    : null;
  const { mutate: reportScoreMutation, isLoading } = useMutation(
    () => reportScore(battleId, reportersSide, value!),
    {
      onSuccess() {
        addToast({
          message: "Score reported",
          type: "success",
        });
      },
      onError() {
        addToast({
          message: "Failed to report score",
          type: "error",
        });
      },
      onSettled() {
        queryClient.invalidateQueries(getBattle.queryKey(battleId));
        queryClient.invalidateQueries(USER_QUERY_KEY);
        setIsConfirmationModalOpen(false);
        closeModal();
      },
    }
  );

  return (
    <div className="relative">
      <CreateDisputeModal
        reportersSide={reportersSide}
        isOpen={isDisputeModalOpen}
        closeModal={() => setIsDisputeModalOpen(false)}
        matchId={match.data.id}
        closeParentModal={closeModal}
      />
      <Modal
        size={"md"}
        isLoading={isLoading}
        isClosable
        isOpen={isConfirmationModalOpen}
        closeModal={() => setIsConfirmationModalOpen(false)}
        title="Are you sure?"
        description="You are about to confirm that the following team won the battle. Once submitted this cannot be undone."
        Footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant={"secondary"}
              title={"Cancel"}
              onClick={() => setIsConfirmationModalOpen(false)}
            />
            <Button
              variant={"primary"}
              title={"Proceed"}
              onClick={() => reportScoreMutation()}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <div className="w-9 aspect-square rounded overflow-hidden">
              <Image
                alt="winning team logo"
                src={resolveStrapiImage(
                  reportedWinner?.data?.attributes.team.data?.attributes.image
                )}
              />
            </div>
            <Text variant="label">
              {reportedWinner?.data?.attributes.team.data?.attributes.name}
            </Text>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpen}
        isLoading={isLoading}
        closeModal={closeModal}
        title={"Report Score"}
        isClosable
        size={"sm"}
        Footer={
          <div className="flex justify-end gap-3">
            <Button
              variant={"secondary"}
              title={"Cancel"}
              onClick={closeModal}
            />
            <Button
              disabled={!value}
              variant={"primary"}
              title={"Report score"}
              onClick={() => setIsConfirmationModalOpen(true)}
            />
          </div>
        }
      >
        <RadioGroupPrimitives.Root
          className="flex flex-col gap-2.5"
          onValueChange={(value) => setValue(value as any)}
          defaultValue={value ?? undefined}
        >
          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-3"
              htmlFor={homeTeam.data?.id.toString()}
            >
              <Text className={"text-brand-white"}>
                {homeTeam.data?.attributes.team.data?.attributes.name}
              </Text>
              {reportersSide === "home" && (
                <Badge textClassName="text-xs" colorScheme={"violet"}>
                  You
                </Badge>
              )}
            </label>

            <RadioGroupPrimitives.Item
              className="bg-transparent border-solid border border-brand-primary w-[18px] h-[18px] rounded-full transition-colors hover:bg-brand-primary/15 outline-none cursor-default"
              value={"home"}
              id={homeTeam.data?.id.toString()}
            >
              <RadioGroupPrimitives.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[10px] after:h-[10px] after:rounded-[50%] after:bg-brand-primary" />
            </RadioGroupPrimitives.Item>
          </div>
          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-3"
              htmlFor={awayTeam.data?.id.toString()}
            >
              <Text className={"text-brand-white"}>
                {awayTeam.data?.attributes.team.data?.attributes.name}
              </Text>
              {reportersSide === "away" && (
                <Badge textClassName="text-xs" colorScheme={"violet"}>
                  You
                </Badge>
              )}
            </label>

            <RadioGroupPrimitives.Item
              className="bg-transparent border-solid border border-brand-primary w-[18px] h-[18px] rounded-full transition-colors hover:bg-brand-primary/15 outline-none cursor-default"
              value={"away"}
              id={awayTeam.data?.id.toString()}
            >
              <RadioGroupPrimitives.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[10px] after:h-[10px] after:rounded-[50%] after:bg-brand-primary" />
            </RadioGroupPrimitives.Item>
          </div>
        </RadioGroupPrimitives.Root>
        <div className=" mt-6">
          <Text
            onClick={() => setIsDisputeModalOpen(true)}
            className={
              "text-brand-white underline underline-offset-4 cursor-pointer inline"
            }
          >
            Dispute this battle
          </Text>
        </div>
      </Modal>
    </div>
  );
};
