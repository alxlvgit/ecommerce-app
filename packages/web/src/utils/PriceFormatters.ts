export const formatCurrency = (price: number) => {
  const withCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
  return withCurrency.includes(".00")
    ? withCurrency.replace(".00", "")
    : withCurrency;
};

export const formatPrice = (price: number) => {
  return price > 0 ? formatCurrency(price) : "Free";
};
