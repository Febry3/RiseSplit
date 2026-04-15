export type CollaboratorInput = {
  id: string;
  address: string;
  percent: string;
};

export type Shareholder = {
  address: string;
  bps: number;
};

export type AssetOption = {
  symbol: "XLM" | "USDC";
  contractId: string;
  decimals: number;
};

export type TransactionStatus = "pending" | "success" | "failed";

export type PaymentRecord = {
  id: string;
  hash: string;
  amount: string;
  asset: string;
  status: TransactionStatus;
  createdAt: number;
};

export type ContractSnapshot = {
  shareholders: Shareholder[];
  totalRevenue: string;
  lastPaymentAt: number;
};

export type ToastKind = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  link?: string;
};
