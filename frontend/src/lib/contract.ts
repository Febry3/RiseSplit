// @ts-nocheck
import "../polyfills";
import * as StellarSdk from "@stellar/stellar-sdk";
import { Spec as ContractSpec } from "@stellar/stellar-sdk/contract";
import { signTransactionWithFreighter } from "./freighter";
import type { ContractSnapshot, Shareholder } from "../types";

const env = {
  rpcUrl: (import.meta.env.VITE_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org").trim(),
  horizonUrl: (import.meta.env.VITE_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org").trim(),
  network: (import.meta.env.VITE_STELLAR_NETWORK ?? "TESTNET").trim(),
  networkPassphrase:
    import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ??
    "Test SDF Network ; September 2015",
  contractId: (import.meta.env.VITE_ROYALTY_CONTRACT_ID ?? "").trim(),
  expertNetwork: (import.meta.env.VITE_STELLAR_EXPERT_NETWORK ?? "testnet").trim(),
};

const sdk = StellarSdk as Record<string, any>;
const rpcNamespace = (sdk.rpc ?? sdk.SorobanRpc) as any;
const contractSpec = new ContractSpec([
  "AAAAAQAAAAAAAAAAAAAAC1NoYXJlaG9sZGVyAAAAAAIAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAADYnBzAAAAAAQ=",
  "AAAABAAAAAAAAAAAAAAADUNvbnRyYWN0RXJyb3IAAAAAAAAEAAAAAAAAABRJbnZhbGlkUGVyY2VudGFnZVN1bQAAAAEAAAAAAAAAE0luc3VmZmljaWVudFBheW1lbnQAAAAAAgAAAAAAAAASVW5hdXRob3JpemVkQWNjZXNzAAAAAAADAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAABA==",
  "AAAAAAAAAAAAAAADcGF5AAAAAAMAAAAAAAAABXBheWVyAAAAAAAAEwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAfQAAAADUNvbnRyYWN0RXJyb3IAAAA=",
  "AAAAAAAAAAAAAAAEaW5pdAAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAMc2hhcmVob2xkZXJzAAAD6gAAB9AAAAALU2hhcmVob2xkZXIAAAAAAQAAA+kAAAACAAAH0AAAAA1Db250cmFjdEVycm9yAAAA",
  "AAAAAAAAAAAAAAAJZ2V0X293bmVyAAAAAAAAAAAAAAEAAAPpAAAAEwAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
  "AAAAAAAAAAAAAAAQZ2V0X3NoYXJlaG9sZGVycwAAAAAAAAABAAAD6QAAA+oAAAfQAAAAC1NoYXJlaG9sZGVyAAAAB9AAAAANQ29udHJhY3RFcnJvcgAAAA==",
  "AAAAAAAAAAAAAAARZ2V0X3RvdGFsX3JldmVudWUAAAAAAAABAAAAAAAAAAVhc3NldAAAAAAAABMAAAABAAAACw==",
  "AAAAAAAAAAAAAAATZ2V0X2xhc3RfcGF5bWVudF9hdAAAAAAAAAAAAQAAAAY=",
]);

const requireConfigured = (): void => {
  if (!env.contractId) {
    throw new Error("VITE_ROYALTY_CONTRACT_ID belum diisi.");
  }
  if (!rpcNamespace?.Server) {
    throw new Error("Soroban RPC client tidak tersedia di @stellar/stellar-sdk.");
  }
};

const normalizeAddressInput = (value: string, label: string): string => {
  const cleaned = (value ?? "").trim();
  const address = cleaned.match(/[GC][A-Z2-7]{55}/)?.[0] ?? cleaned;
  if (!address) {
    throw new Error(`${label} kosong.`);
  }

  const isAccount = Boolean(sdk.StrKey?.isValidEd25519PublicKey?.(address));
  const isContract = Boolean(sdk.StrKey?.isValidContract?.(address));
  if (!isAccount && !isContract) {
    throw new Error(`${label} tidak valid. Gunakan alamat Stellar lengkap (G... atau C...).`);
  }

  return address;
};

const normalizeAccountAddress = (value: string, label: string): string => {
  const address = normalizeAddressInput(value, label);
  const isAccount = Boolean(sdk.StrKey?.isValidEd25519PublicKey?.(address));
  if (!isAccount) {
    throw new Error(`${label} harus alamat akun (G...).`);
  }
  return address;
};

const getServer = () =>
  new rpcNamespace.Server(env.rpcUrl, {
    allowHttp: env.rpcUrl.startsWith("http://"),
  });

const getNetworkPassphrase = (): string => {
  if (env.networkPassphrase) return env.networkPassphrase;
  return env.network === "PUBLIC" ? sdk.Networks.PUBLIC : sdk.Networks.TESTNET;
};

const toMethodArgs = (method: string, args: Record<string, unknown>): unknown[] => {
  return contractSpec.funcArgsToScVals(method, args);
};

const buildInvokeTx = async (
  sourceAddress: string,
  method: string,
  args: Record<string, unknown>,
  options?: { assemble?: boolean },
) => {
  requireConfigured();
  const server = getServer();
  const contract = new sdk.Contract(env.contractId);
  const account = await server.getAccount(normalizeAccountAddress(sourceAddress, "Source address"));
  const scArgs = toMethodArgs(method, args);
  const shouldAssemble = options?.assemble ?? true;

  const baseFee = String(sdk.BASE_FEE ?? "100");
  let tx = new sdk.TransactionBuilder(account, {
    fee: baseFee,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(120)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (sim?.error) {
    throw new Error(String(sim.error));
  }

  if (shouldAssemble && rpcNamespace.assembleTransaction) {
    const assembled = rpcNamespace.assembleTransaction(tx, sim);
    tx = assembled.build ? assembled.build() : assembled;
  }

  return { server, sim, tx };
};

const parseSimulationReturn = (sim: any): unknown => {
  const raw = sim?.result?.retval ?? sim?.results?.[0]?.retval ?? null;
  if (!raw) return null;
  if (sdk.scValToNative) {
    return sdk.scValToNative(raw);
  }
  return raw;
};

const waitForTx = async (server: any, hash: string): Promise<any> => {
  for (let i = 0; i < 35; i += 1) {
    const tx = await server.getTransaction(hash);
    if (tx?.status === "SUCCESS" || tx?.status === "FAILED") {
      return tx;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error("Timeout saat menunggu status transaksi.");
};

const sendSignedTx = async (
  sourceAddress: string,
  method: string,
  args: Record<string, unknown>,
): Promise<{ hash: string; explorerUrl: string }> => {
  let server: any;
  let tx: any;
  try {
    const built = await buildInvokeTx(sourceAddress, method, args);
    server = built.server;
    tx = built.tx;
  } catch (error) {
    throw new Error(`PrepareTx failed: ${String(error)}`);
  }

  let signedTxXdr = "";
  try {
    signedTxXdr = await signTransactionWithFreighter(
      tx.toXDR(),
      sourceAddress,
      getNetworkPassphrase(),
    );
  } catch (error) {
    throw new Error(`FreighterSign failed: ${String(error)}`);
  }

  let send: any;
  try {
    // Avoid parsing signed XDR in browser runtime; send it directly to RPC.
    send = await server.sendTransaction({ toXDR: () => signedTxXdr });
  } catch (error) {
    throw new Error(`SendTx failed: ${String(error)}`);
  }

  if (send?.errorResultXdr || send?.status === "ERROR") {
    throw new Error(String(send?.errorResultXdr ?? send?.error ?? "Send transaction gagal."));
  }

  const txHash = send?.hash ?? "";
  if (!txHash) {
    throw new Error("SendTx failed: missing transaction hash from RPC.");
  }

  if (send?.status === "PENDING") {
    const finalTx = await waitForTx(server, txHash);
    if (finalTx?.status !== "SUCCESS") {
      throw new Error(String(finalTx?.resultXdr ?? "Transaksi gagal di ledger."));
    }
  }

  return {
    hash: txHash,
    explorerUrl: `https://stellar.expert/explorer/${env.expertNetwork}/tx/${txHash}`,
  };
};

const callReadonly = async (
  sourceAddress: string,
  method: string,
  args: Record<string, unknown>,
): Promise<unknown> => {
  const { sim } = await buildInvokeTx(sourceAddress, method, args, { assemble: false });
  return parseSimulationReturn(sim);
};

const normalizeShareholders = (raw: unknown): Shareholder[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const record = row as Record<string, unknown>;
      const address = String(record.address ?? "");
      const bps = Number(record.bps ?? 0);
      if (!address) return null;
      return { address, bps };
    })
    .filter((row): row is Shareholder => row !== null);
};

export const getXlmBalance = async (address: string): Promise<string> => {
  const res = await fetch(`${env.horizonUrl}/accounts/${address}`);
  if (!res.ok) {
    throw new Error("Gagal membaca saldo account dari Horizon.");
  }

  const payload = (await res.json()) as {
    balances?: Array<{ asset_type?: string; balance?: string }>;
  };

  const native = payload.balances?.find((b) => b.asset_type === "native");
  return native?.balance ?? "0";
};

export const fetchContractSnapshot = async (
  sourceAddress: string,
  assetContractId: string,
): Promise<ContractSnapshot> => {
  const normalizedAsset = normalizeAddressInput(assetContractId, "Asset contract ID");
  let shareholdersRaw: unknown = [];
  let revenueRaw: unknown = "0";
  let lastPaymentRaw: unknown = 0;

  try {
    shareholdersRaw = await callReadonly(sourceAddress, "get_shareholders", {});
  } catch {
    shareholdersRaw = [];
  }

  try {
    revenueRaw = await callReadonly(sourceAddress, "get_total_revenue", { asset: normalizedAsset });
  } catch {
    revenueRaw = "0";
  }

  try {
    lastPaymentRaw = await callReadonly(sourceAddress, "get_last_payment_at", {});
  } catch {
    lastPaymentRaw = 0;
  }

  return {
    shareholders: normalizeShareholders(shareholdersRaw),
    totalRevenue: String(revenueRaw ?? "0"),
    lastPaymentAt: Number(lastPaymentRaw ?? 0),
  };
};

export const initRoyaltySplitter = async (
  owner: string,
  shareholders: Shareholder[],
): Promise<{ hash: string; explorerUrl: string }> => {
  return sendSignedTx(normalizeAccountAddress(owner, "Owner address"), "init", {
    owner: normalizeAccountAddress(owner, "Owner address"),
    shareholders: shareholders.map((row) => ({
      address: normalizeAccountAddress(row.address, "Shareholder address"),
      bps: row.bps,
    })),
  });
};

export const payRoyalty = async (
  payer: string,
  assetContractId: string,
  atomicAmount: string,
): Promise<{ hash: string; explorerUrl: string }> => {
  return sendSignedTx(normalizeAccountAddress(payer, "Payer address"), "pay", {
    payer: normalizeAccountAddress(payer, "Payer address"),
    asset: normalizeAddressInput(assetContractId, "Asset contract ID"),
    amount: BigInt(atomicAmount),
  });
};
