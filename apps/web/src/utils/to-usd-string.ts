export const toUsdString = (cents: number, forceShowCents: boolean = true) => {
  const options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
  };

  if (!forceShowCents) {
    options.minimumFractionDigits = 0;
    options.maximumFractionDigits = 2;
  }

  return (cents / 100).toLocaleString("en-US", options);
};
