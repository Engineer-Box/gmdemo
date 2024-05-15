import { AuthenticatedUser } from "@/hooks/use-auth";
import { CreateBattleInputs } from "./components/create-battle-modal";
import { getTeamProfileForUserBy } from "../profile/util";
import { CreateBattleParams } from "./service/create-battle";
import { MatchOptionsWithoutRelations } from "./types";
import { Game } from "../game/types";
import { LeaderboardItemStats } from "./service/get-game-leaderboard";
import { convertToOrdinal } from "@/utils/convert-to-ordinal";
import { toUsdString } from "@/utils/to-usd-string";

export const getAvailableTimes = () => {
  const times = [];
  let currentDate = new Date();
  let minutes = Math.ceil(currentDate.getMinutes() / 15) * 15;

  if (minutes === currentDate.getMinutes()) {
    minutes += 15;
  }

  if (minutes === 60) {
    currentDate.setHours(currentDate.getHours() + 1);
    minutes = 0;
  }

  currentDate.setMinutes(minutes, 0, 0);

  const endTime = new Date(currentDate);
  endTime.setHours(23, 45, 0);

  while (currentDate <= endTime) {
    times.push(currentDate.toISOString());

    currentDate = new Date(currentDate.getTime() + 15 * 60000);
  }

  return times;
};

export const getTeamSizeNumberFromTeamOption = (
  teamSize: CreateBattleInputs["teamSize"]
): number => (teamSize ? parseInt(teamSize[0]) : 0);

export const getSeriesNumberFromSeriesOption = (
  series: CreateBattleParams["series"]
) => parseInt(series.slice(2));

export const getCentsFromStringValue = (value: string) =>
  parseFloat(value) * 100;

export const getRelativeStartTime = (date: string) => {
  const start = new Date(date);
  const now = new Date();

  const diff = start.getTime() - now.getTime();

  if (diff <= 0) return "Started";

  const diffInMinutes = Math.floor(diff / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  } else {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  }
};

export const getUnableToCreateOrJoinBattlesReason = (
  gameId: number,
  wagerAmountPerPerson: number,
  user: AuthenticatedUser | null
) => {
  if (!user) {
    return "You must be logged in to create a battle";
  }

  const teamProfile = getTeamProfileForUserBy("gameId", gameId, user);

  if (!teamProfile) {
    return "You must create or join a team before creating a battle";
  }

  if (teamProfile.attributes.role === "member") {
    return "You must be a leader or founder to create a battle";
  }

  if (
    wagerAmountPerPerson > 0 &&
    wagerAmountPerPerson >= user.data.profile.balance
  ) {
    return "You do not have enough balance to create this battle";
  }

  if (wagerAmountPerPerson > 0 && !user.data.profile.wager_mode) {
    return "You must enable wager mode before creating wagers";
  }

  return null;
};

export const getCustomAttributeOptionDisplayName = (
  optionId: string,
  attributeId: string,
  gameAttributes: Game["custom_attributes"]
) => {
  const gamesCorrespondingCustomAttribute = gameAttributes.find(
    (ca) => ca.attribute.attribute_id === attributeId
  );

  const gamesOption = gamesCorrespondingCustomAttribute?.options.find(
    (o) => o.option_id === optionId
  );

  return gamesOption?.display_name ?? null;
};

export const getGameModeDisplayValue = (
  customAttributeInputs: MatchOptionsWithoutRelations["custom_attribute_inputs"],
  gameAttributes: Game["custom_attributes"]
) =>
  getCustomAttributeOptionDisplayName(
    customAttributeInputs.find((cai) => cai.attribute_id === "game_mode")
      ?.value as string,
    "game_mode",
    gameAttributes
  ) ?? "Unknown";

export class LeaderboardItemStatsUtils {
  static getRankText(v?: LeaderboardItemStats, ordinal = false) {
    if (!v?.rank) return "U";

    return ordinal ? convertToOrdinal(v.rank) : v.rank.toString();
  }
  static getEarningsText(v?: LeaderboardItemStats) {
    return toUsdString(v?.earnings ?? 0, false);
  }

  static getWinRateText(v?: LeaderboardItemStats) {
    if (!v) return "N/A";
    if (v.lost === 0 && v.won > 0) return "100%";

    const winRate = v.won / (v.won + v.lost);

    return `${Math.round(Number.isNaN(winRate) ? 0 : winRate)}%`;
  }
  static getXpText(v?: LeaderboardItemStats) {
    if (!v) return 1000;

    return Math.max(v.xp / 10 + 1000, 1);
  }
  static getWinCountText(v?: LeaderboardItemStats) {
    if (!v) return 0;
    return v.won;
  }
  static getLostCountText(v?: LeaderboardItemStats) {
    if (!v) return 0;
    return v.lost;
  }
}
