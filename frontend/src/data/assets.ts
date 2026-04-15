import type { AssetOption } from "../types";

const envValue = (value: string | undefined): string => (value ?? "").trim();

export const ASSET_OPTIONS: AssetOption[] = [
  {
    symbol: "XLM",
    contractId: envValue(import.meta.env.VITE_XLM_SAC_CONTRACT_ID),
    decimals: 7,
  },
  {
    symbol: "USDC",
    contractId: envValue(import.meta.env.VITE_USDC_SAC_CONTRACT_ID),
    decimals: 7,
  },
];
