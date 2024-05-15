import { GameResponse } from "@/features/game/types";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { UseFormSetValue } from "react-hook-form";
import { CreateBattleInputs } from "../components/create-battle-modal";
import { useDollarInput } from "@/components/dollar-input";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getTeamSizeNumberFromTeamOption } from "../util";
import { CreateBattleParams } from "../service/create-battle";

type LastMatchSettings = CreateBattleParams &
  Pick<CreateBattleInputs, "teamSize">;

export const useApplyLastMatch = (
  game: GameResponse,
  user: AuthenticatedUser,
  setFormValue: UseFormSetValue<CreateBattleInputs>,
  setTeamSelection: React.Dispatch<React.SetStateAction<number[]>>,
  setDollarInputValue: ReturnType<typeof useDollarInput>["setValue"]
) => {
  const [lastBattleInputs, setLastBattleInputs] = useLocalStorage<
    Record<number, LastMatchSettings>
  >("last-match-settings", {});

  const canApplyLastMatch = !!lastBattleInputs?.[game.id];

  const saveLastMatch = (gameId: number, lastMatch: LastMatchSettings) => {
    setLastBattleInputs((prev) => ({
      ...prev,
      [gameId]: lastMatch,
    }));
  };
  const applyLastMatch = () => {
    const lastBattleInput = lastBattleInputs?.[game.id]!;

    setFormValue("region", lastBattleInput.region);
    setFormValue("series", lastBattleInput.series);
    setFormValue("teamSize", lastBattleInput.teamSize);

    const hasSufficientBalanceToMatch =
      user.data.profile.balance >=
      lastBattleInput.wagerAmountPerPerson /
        getTeamSizeNumberFromTeamOption(lastBattleInput.teamSize);

    if (hasSufficientBalanceToMatch) {
      setDollarInputValue(
        (lastBattleInput.wagerAmountPerPerson / 100).toFixed(2)
      );
    }

    setTeamSelection(lastBattleInput.teamSelection);

    game.attributes.custom_attributes.forEach((ca) => {
      const attributeId = ca.attribute.attribute_id;
      const previousCustomAttributeInput = (lastBattleInput.customAttributes ??
        {})[attributeId];

      if (previousCustomAttributeInput) {
        setFormValue(
          `customAttributes.${attributeId}`,
          previousCustomAttributeInput
        );
      }
    });
  };

  return {
    canApplyLastMatch,
    applyLastMatch,
    saveLastMatch,
  } as const;
};
