import { Control } from "react-hook-form";
import { DarkSimpleSelect } from "./dark-simple-select";
import { CreateBattleInputs } from "./create-battle-modal";
import { DarkToggleGroup } from "./dark-toggle-group";
import { CustomAttributeInput } from "./custom-attribute-input";
import { DollarInput, useDollarInput } from "@/components/dollar-input";
import { Button } from "@/components/button";
import { useToast } from "@/providers/toast-provider";
import {
  getCentsFromStringValue,
  getTeamSizeNumberFromTeamOption,
  getUnableToCreateOrJoinBattlesReason,
} from "../util";
import { BattleDetailLabelGroup } from "./battle-detail-label-group";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { MatchRegions } from "../types";
import { SelectCustomAttribute } from "@/features/game/types";

const BATTLE_REGIONS: MatchRegions[] = [
  "Europe",
  "North America",
  "Asia",
  "Oceania",
];
const Content = ({
  control,
  timeOptions,
  teamSizeOptions,
  customAttributes,
  setValue,
  value,
  teamSize,
}: {
  control: Control<CreateBattleInputs>;
  timeOptions: string[];
  teamSizeOptions: string[];
  customAttributes: SelectCustomAttribute[];
  teamSize: number;
} & Omit<ReturnType<typeof useDollarInput>, "amountInCents">) => {
  return (
    <div className="flex flex-col gap-3">
      <BattleDetailLabelGroup title="Start time">
        <DarkSimpleSelect
          name="time"
          control={control}
          options={timeOptions}
          getOptionLabel={(iso) =>
            new Date(iso).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />
      </BattleDetailLabelGroup>
      <BattleDetailLabelGroup title="Region">
        <DarkSimpleSelect
          name="region"
          control={control}
          options={BATTLE_REGIONS}
        />
      </BattleDetailLabelGroup>
      <BattleDetailLabelGroup title="Team size">
        <DarkToggleGroup
          name="teamSize"
          control={control}
          options={teamSizeOptions}
        />
      </BattleDetailLabelGroup>
      <BattleDetailLabelGroup title="Series">
        <DarkToggleGroup
          name="series"
          control={control}
          options={["Bo1", "Bo3", "Bo5"]}
        />
      </BattleDetailLabelGroup>
      {customAttributes.map((customAttribute) => (
        <CustomAttributeInput
          key={customAttribute.attribute.attribute_id}
          control={control}
          customAttribute={customAttribute}
        />
      ))}
      <BattleDetailLabelGroup title="Wager">
        <DollarInput
          variant="small"
          setValue={setValue}
          value={value}
          stepInCents={100}
        />
      </BattleDetailLabelGroup>
    </div>
  );
};

const Footer = ({
  closeModal,
  wagerAmountPerPerson,
  isFormValid,
  teamSize,
  nextStep,
  gameId,
  user,
}: {
  closeModal: () => void;
  wagerAmountPerPerson: number;
  isFormValid: () => Promise<boolean>;
  gameId: number;
  teamSize: CreateBattleInputs["teamSize"];
  nextStep: () => void;
  user: AuthenticatedUser;
}) => {
  const { addToast } = useToast();
  return (
    <>
      <Button variant={"secondary"} title="Cancel" onClick={closeModal} />
      <Button
        title="Next"
        onClick={async () => {
          if (!(await isFormValid())) {
            return;
          }

          const reason = getUnableToCreateOrJoinBattlesReason(
            gameId,
            wagerAmountPerPerson,
            user
          );

          if (reason) {
            addToast({
              type: "error",
              message: reason,
            });

            return;
          }

          nextStep();
        }}
      />
    </>
  );
};

export const CreateBattleDetailsStep = {
  Content,
  Footer,
};
