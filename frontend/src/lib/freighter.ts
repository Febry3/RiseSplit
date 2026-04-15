import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

type ApiError = {
  code?: number;
  message?: string;
  ext?: string[];
};

const parseError = (error: unknown): string => {
  if (!error) return "";
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const payload = error as Record<string, unknown>;
    const apiError = payload.error as ApiError | string | undefined;

    if (typeof apiError === "string") return apiError;
    if (apiError?.message) return apiError.message;

    if (typeof payload.message === "string") return payload.message;
  }

  return "";
};

const ensureFreighterConnected = async (): Promise<void> => {
  const conn = await isConnected();
  if (conn.error) {
    throw new Error(conn.error.message || "Freighter tidak merespons.");
  }
  if (!conn.isConnected) {
    throw new Error("Freighter extension belum terpasang atau belum aktif.");
  }
};

const sdk = StellarSdk as Record<string, any>;

const normalizeWalletAddress = (value: string, label: string): string => {
  const cleaned = (value ?? "").trim();
  const extracted = cleaned.match(/[GC][A-Z2-7]{55}/)?.[0] ?? cleaned;

  if (!extracted) {
    throw new Error(`${label} kosong.`);
  }

  try {
    sdk.Address.fromString(extracted);
  } catch {
    throw new Error(
      `${label} tidak valid (${extracted.length} chars). Pastikan copy alamat penuh dari Freighter.`,
    );
  }

  return extracted;
};

export const connectWallet = async (): Promise<string> => {
  await ensureFreighterConnected();

  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error.message || "Akses wallet ditolak di Freighter.");
  }
  if (access.address) {
    return normalizeWalletAddress(access.address, "Alamat wallet Freighter");
  }

  const addressResult = await getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error.message || "Gagal membaca alamat wallet.");
  }
  if (!addressResult.address) {
    throw new Error("Freighter mengembalikan alamat kosong.");
  }

  return normalizeWalletAddress(addressResult.address, "Alamat wallet Freighter");
};

export const getFreighterNetworkPassphrase = async (): Promise<string> => {
  const details = await getNetworkDetails();
  if (details.error) {
    return "";
  }
  return details.networkPassphrase || "";
};

export const signTransactionWithFreighter = async (
  transactionXdr: string,
  address: string,
  networkPassphrase: string,
): Promise<string> => {
  const signerAddress = normalizeWalletAddress(address, "Signer address");
  const result = await signTransaction(transactionXdr, {
    address: signerAddress,
    networkPassphrase,
  });

  if (result.error) {
    throw new Error(result.error.message || "Freighter gagal menandatangani transaksi.");
  }
  if (!result.signedTxXdr) {
    throw new Error(parseError(result) || "Freighter tidak mengembalikan signed transaction.");
  }

  return result.signedTxXdr.trim();
};
