// The data in beforeCreate/update hooks varies based on whether the request was made via the API or the Admin UI
export const resolveRelationIdForHookData = (
  data: number | { connect: { id: number }[] },
) => {
  if (typeof data === "number") {
    return data;
  } else if (typeof data === "string") {
    return parseInt(data);
  }
  return data.connect[0]?.id;
};
