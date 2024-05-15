import { strapiApi } from "@/lib/strapi";
import { TeamResponse, teamPopulate } from "../types";

export const createTeam = async ({
  name,
  gameId,
  image,
}: {
  name: string;
  gameId: number;
  image?: number;
}) => {
  const newTeam = await strapiApi.create<TeamResponse>(
    "teams",
    {
      name,
      game: gameId,
      image,
    },
    {
      populate: teamPopulate,
    }
  );

  return newTeam;
};
