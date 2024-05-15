/**
 * match service
 */

import { factories } from "@strapi/strapi";

type MatchMeta = {
  single: Record<string, string>;
  series: Record<string, string>[];
};

const getRandomValue = (array: any[]) => {
  if (array.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const handlePickRandomCustomAttribute = (
  matchMeta: MatchMeta,
  customAttribute: any,
) => {
  // TODO: consider allowing these to be single or series
  matchMeta.series.forEach((series) => {
    series[customAttribute.attribute.display_name] = getRandomValue(
      customAttribute.options,
    ).display_name;
  });
};

const handleSelectCustomAttribute = (
  matchMeta: MatchMeta,
  customAttribute: any,
  customAttributeInput: any,
) => {
  const isGameModeAttribute =
    customAttribute.attribute.attribute_id === "game_mode";
  const isMultiSelect = customAttribute.input_type === "multi-select";

  if (
    isGameModeAttribute &&
    customAttributeInput.value === "random" &&
    !isMultiSelect
  ) {
    const options = customAttribute.options.filter(
      (o) => o.option_id !== "random",
    );
    if (matchMeta.series.length === 1) {
      matchMeta.single[customAttribute.attribute.display_name] =
        getRandomValue(options).display_name;
    } else {
      matchMeta.series.forEach((series) => {
        series[customAttribute.attribute.display_name] =
          getRandomValue(options).display_name;
      });
    }
  } else {
    const customAttributeInputValueArray = Array.isArray(
      customAttributeInput.value,
    )
      ? customAttributeInput.value
      : [customAttributeInput.value];

    const optionDisplayName = customAttribute.options
      .filter((o) => customAttributeInputValueArray.includes(o.option_id))
      .map((o) => o.display_name)
      .join(", ");
    matchMeta.single[customAttribute.attribute.display_name] =
      optionDisplayName;
  }
};

export default factories.createCoreService("api::match.match", {
  async openDispute(matchId: number) {
    const match = await super.findOne(matchId, {
      populate: {
        battle: true,
        dispute: true,
      },
    });

    if (!match) throw new Error("Match not found");
    if (!match.battle) throw new Error("Not implemented");
    if (match.dispute) return;
    if (match.result) {
      throw new Error("Cannot open a dispute for a match that has a result");
    }

    const dispute = await strapi.service("api::dispute.dispute").create({
      data: {
        match: matchId,
      },
    });

    try {
      const captains = await this.getTeamCaptains(matchId);

      await Promise.all(
        [captains.home, captains.away].map(async (captain) => {
          const profileId = captain.profile.id;
          const image = captain.team?.image;
          const path = `/battle/${matchId}`;
          const title = `Match ${matchId} has been disputed`;
          await strapi
            .service("api::notification.notification")
            .createRedirectNotification(profileId, {
              title,
              path,
              image,
            });
        }),
      );
    } catch (e) {
      console.log("error whilst notifying", e);
    }

    return dispute;
  },

  async getTeamCaptains(matchId: number) {
    const match = await super.findOne(matchId, {
      populate: {
        home_team: {
          populate: {
            team: {
              populate: {
                image: true,
              },
            },
            team_selection_profiles: {
              populate: {
                team_profile: {
                  populate: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        away_team: {
          populate: {
            team: {
              populate: {
                image: true,
              },
            },
            team_selection_profiles: {
              populate: {
                team_profile: {
                  populate: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const homeTeamCaptainTeamProfile =
      match.home_team.team_selection_profiles.find((tsp) => tsp.is_captain)
        ?.team_profile;

    const awayTeamCaptainTeamProfile =
      match.away_team?.team_selection_profiles.find((tsp) => tsp.is_captain)
        ?.team_profile;

    if (!homeTeamCaptainTeamProfile) {
      throw new Error("Home team captain not found");
    }

    return {
      home: {
        ...homeTeamCaptainTeamProfile,
        team: match.home_team.team,
      },
      away: awayTeamCaptainTeamProfile
        ? { ...awayTeamCaptainTeamProfile, team: match.away_team.team }
        : null,
    };
  },
  async generateMatchMeta(matchId: number) {
    const match = await super.findOne(matchId, {
      populate: {
        battle: {
          populate: {
            match_options: {
              populate: {
                game: {
                  populate: {
                    custom_attributes: {
                      populate: {
                        attribute: true,
                        options: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const matchMeta: MatchMeta = {
      single: {},
      series: Array.from({ length: match.battle.match_options.series }).map(
        () => ({}),
      ),
    };

    const customAttributes = match.battle.match_options.game.custom_attributes;
    const customAttributeInputs =
      match.battle.match_options.custom_attribute_inputs;

    for (const customAttribute of customAttributes) {
      const customAttributeType = customAttribute.__component;

      switch (customAttributeType) {
        case "custom-attributes.pick-random":
          handlePickRandomCustomAttribute(matchMeta, customAttribute);
          break;

        case "custom-attributes.select":
          const matchingCustomAttributeInput = customAttributeInputs.find(
            (cai) =>
              cai.attribute_id === customAttribute.attribute.attribute_id,
          );
          handleSelectCustomAttribute(
            matchMeta,
            customAttribute,
            matchingCustomAttributeInput,
          );
          break;

        default:
          break;
      }
    }

    await super.update(matchId, {
      data: {
        match_meta: matchMeta,
      },
    });
  },
});
