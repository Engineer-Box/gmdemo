import { getEthersProvider } from "./eth-utils";
import { processTransactions } from "./process-transactions";

const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
const isStage = process.env.NEXT_PUBLIC_APP_ENV === "staging";

export default {
  register(/*{ strapi }*/) {},
  async bootstrap({ strapi }) {
    console.log("bootstraping....");

    const apiModels = strapi.db.config.models.filter(
      ({ uid }) => typeof uid == "string" && uid.startsWith("api::"),
    );

    const apiModelNames = apiModels.map(({ uid }) => uid);

    console.log(apiModelNames);
    console.log(process.env.NEXT_PUBLIC_GAMERLY_SMART_CONTRACT_ADDRESS);
    console.log(process.env.GAMERLY_SMART_CONTRACT_OWNER_PRIVATE_KEY);

    await strapi
      .service("api::leaderboard.leaderboard")
      .recalculateLeaderboards();
  },
};
