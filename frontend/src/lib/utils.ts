export const shortAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export const isStellarAddress = (address: string): boolean => {
  return /^G[A-Z2-7]{55}$/.test(address.trim());
};

export const toAtomicAmount = (amount: string, decimals: number): bigint => {
  const normalized = amount.trim();
  if (!normalized) return BigInt(0);

  const [whole = "0", frac = ""] = normalized.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const joined = `${whole}${fracPadded}`.replace(/^0+(?=\d)/, "");
  return BigInt(joined || "0");
};

export const fromAtomicAmount = (amount: string | bigint, decimals: number): string => {
  const raw = typeof amount === "bigint" ? amount.toString() : amount;
  const negative = raw.startsWith("-");
  const clean = negative ? raw.slice(1) : raw;
  const padded = clean.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals);
  const frac = padded.slice(-decimals).replace(/0+$/, "");
  const value = frac ? `${whole}.${frac}` : whole;
  return negative ? `-${value}` : value;
};

export const percentToBps = (percent: string): number => {
  const value = Number.parseFloat(percent);
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.round(value * 100);
};
