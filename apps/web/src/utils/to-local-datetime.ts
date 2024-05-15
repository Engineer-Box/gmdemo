export const toLocalDateTime = (date: string) =>
  new Date(date)
    .toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(" at ", ", ");
