import { errors } from "@strapi/utils";
const { ApplicationError } = errors;

export default {
  beforeCreateMany() {
    throw new ApplicationError("Cannot create multiple disputes at once");
  },
  beforeUpdateMany() {
    throw new ApplicationError("Cannot update multiple disputes at once");
  },

  async afterCreate({ result }) {
    if (result.resolved_winner) {
      await strapi.service("api::match.match").delete(result.id);
      throw new ApplicationError("Cannot create dispute with resolved winner");
    }
  },

  async beforeUpdate({ params, state }) {
    const disputeId = params.where.id;
    const dispute = await strapi.entityService.findOne(
      "api::dispute.dispute",
      disputeId,
    );
    const initialResolvedWinner = dispute.resolved_winner;
    const updatedResolvedWinner = params.data.resolved_winner;
    const resolvedWinnerDidChange =
      updatedResolvedWinner !== initialResolvedWinner;

    if (initialResolvedWinner && resolvedWinnerDidChange) {
      throw new ApplicationError("Cannot update resolved winner");
    }

    state.resolvedWinner = resolvedWinnerDidChange
      ? updatedResolvedWinner
      : null;
  },
  async afterUpdate({ result, state }) {
    if (state.resolvedWinner) {
      const dispute = await strapi.entityService.findOne(
        "api::dispute.dispute",
        result.id,
        {
          populate: {
            match: {
              populate: {
                battle: true,
              },
            },
          },
        },
      );
      // TODO: This will need updating for tournaments to call completeTournament instead
      const battleId = dispute?.match?.battle?.id;
      if (battleId) {
        await strapi
          .service("api::battle.battle")
          .completeBattle(battleId, state.resolvedWinner);
      }
    }
  },
};
