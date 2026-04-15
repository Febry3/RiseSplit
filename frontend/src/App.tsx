import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Share2, TrendingUp, Wallet } from "lucide-react";
import { ASSET_OPTIONS } from "./data/assets";
import {
  fetchContractSnapshot,
  getXlmBalance,
  initRoyaltySplitter,
  payRoyalty,
} from "./lib/contract";
import { getFriendlyError } from "./lib/error-map";
import { connectWallet, getFreighterNetworkPassphrase } from "./lib/freighter";
import {
  fromAtomicAmount,
  isStellarAddress,
  percentToBps,
  shortAddress,
  toAtomicAmount,
} from "./lib/utils";
import type {
  CollaboratorInput,
  PaymentRecord,
  Shareholder,
  ToastItem,
} from "./types";

const makeRow = (): CollaboratorInput => ({
  id: crypto.randomUUID(),
  address: "",
  percent: "",
});

const formatDate = (unixSeconds: number): string => {
  if (!unixSeconds) return "-";
  return new Date(unixSeconds * 1000).toLocaleString();
};

const formatCurrency = (atomicValue: string, decimals: number): string => {
  const normalized = fromAtomicAmount(atomicValue, decimals);
  return Number(normalized).toLocaleString(undefined, {
    maximumFractionDigits: 7,
  });
};

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [collaborators, setCollaborators] = useState<CollaboratorInput[]>([
    makeRow(),
    makeRow(),
  ]);
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<
    "XLM" | "USDC"
  >("XLM");
  const [payAmount, setPayAmount] = useState("");

  const [totalRevenueAtomic, setTotalRevenueAtomic] = useState("0");
  const [lastPaymentAt, setLastPaymentAt] = useState(0);
  const [chainShareholders, setChainShareholders] = useState<Shareholder[]>([]);
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const selectedAsset = useMemo(
    () =>
      ASSET_OPTIONS.find((asset) => asset.symbol === selectedAssetSymbol) ??
      ASSET_OPTIONS[0],
    [selectedAssetSymbol],
  );

  const totalPercent = useMemo(
    () =>
      collaborators.reduce(
        (sum, row) => sum + (Number.parseFloat(row.percent) || 0),
        0,
      ),
    [collaborators],
  );

  const totalPercentOk = Math.round(totalPercent * 100) === 10_000;

  const formValid = useMemo(() => {
    if (!totalPercentOk || collaborators.length === 0) return false;
    return collaborators.every(
      (row) =>
        isStellarAddress(row.address) && Number.parseFloat(row.percent) > 0,
    );
  }, [collaborators, totalPercentOk]);

  const activeShareholders = useMemo(() => {
    if (chainShareholders.length > 0) {
      return chainShareholders;
    }

    return collaborators
      .map((row) => ({
        address: row.address.trim(),
        bps: percentToBps(row.percent),
      }))
      .filter((row) => row.address && row.bps > 0);
  }, [chainShareholders, collaborators]);

  const estimatedPayouts = useMemo(() => {
    const amount = Number.parseFloat(payAmount || "0");
    if (!Number.isFinite(amount) || amount <= 0) return [];

    return activeShareholders.map((row) => ({
      address: row.address,
      amount: (amount * row.bps) / 10_000,
    }));
  }, [activeShareholders, payAmount]);

  const pushToast = (
    kind: ToastItem["kind"],
    message: string,
    link?: string,
  ): void => {
    const next: ToastItem = { id: crypto.randomUUID(), kind, message, link };
    setToasts((prev) => [next, ...prev].slice(0, 4));

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== next.id));
    }, 5500);
  };

  const refreshFromChain = async (address: string): Promise<void> => {
    if (
      !address ||
      !selectedAsset.contractId ||
      selectedAsset.contractId === "CHANGE_ME"
    )
      return;

    setIsRefreshing(true);
    try {
      const snapshot = await fetchContractSnapshot(
        address,
        selectedAsset.contractId,
      );
      setChainShareholders(snapshot.shareholders);
      setTotalRevenueAtomic(snapshot.totalRevenue);
      setLastPaymentAt(snapshot.lastPaymentAt);
    } catch (error) {
      // Keep wallet/session usable even if on-chain analytics read fails.
      const text = String(error ?? "");
      if (text.includes("NotInitialized")) {
        setChainShareholders([]);
        setTotalRevenueAtomic("0");
        setLastPaymentAt(0);
        return;
      }
      pushToast("error", getFriendlyError(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnectWallet = async (): Promise<void> => {
    setIsConnecting(true);
    try {
      const address = await connectWallet();
      const freighterPassphrase = await getFreighterNetworkPassphrase();
      const appPassphrase = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? "";

      if (freighterPassphrase && appPassphrase && freighterPassphrase !== appPassphrase) {
        throw new Error("Network mismatch: switch Freighter ke Testnet terlebih dulu.");
      }

      setWalletAddress(address);

      const balance = await getXlmBalance(address);
      setXlmBalance(balance);

      pushToast("success", "Wallet terhubung.");
      await refreshFromChain(address);
    } catch (error) {
      pushToast("error", getFriendlyError(error));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeploy = async (): Promise<void> => {
    if (!walletAddress || !formValid) return;

    const payload = collaborators.map((row) => ({
      address: row.address.trim(),
      bps: percentToBps(row.percent),
    }));

    setIsDeploying(true);
    pushToast("info", "Deploy transaksi init dikirim...");

    try {
      const tx = await initRoyaltySplitter(walletAddress, payload);
      pushToast(
        "success",
        "Konfigurasi royalti berhasil diinisialisasi.",
        tx.explorerUrl,
      );
      await refreshFromChain(walletAddress);
    } catch (error) {
      pushToast("error", getFriendlyError(error));
    } finally {
      setIsDeploying(false);
    }
  };

  const handlePay = async (): Promise<void> => {
    if (
      !walletAddress ||
      !selectedAsset.contractId ||
      selectedAsset.contractId === "CHANGE_ME"
    ) {
      pushToast("error", "Asset contract ID belum dikonfigurasi.");
      return;
    }

    const atomic = toAtomicAmount(payAmount, selectedAsset.decimals);
    if (atomic <= 0n) {
      pushToast("error", "Jumlah pembayaran harus lebih dari 0.");
      return;
    }

    setIsPaying(true);
    pushToast("info", "Transaksi pembayaran diproses...");

    try {
      const tx = await payRoyalty(
        walletAddress,
        selectedAsset.contractId,
        atomic.toString(),
      );

      const row: PaymentRecord = {
        id: crypto.randomUUID(),
        hash: tx.hash,
        amount: payAmount,
        asset: selectedAsset.symbol,
        status: "success",
        createdAt: Date.now(),
      };

      setRecords((prev) => [row, ...prev].slice(0, 20));
      pushToast("success", "Pembayaran sukses.", tx.explorerUrl);
      await refreshFromChain(walletAddress);
      const balance = await getXlmBalance(walletAddress);
      setXlmBalance(balance);
    } catch (error) {
      setRecords((prev) => [
        {
          id: crypto.randomUUID(),
          hash: "-",
          amount: payAmount,
          asset: selectedAsset.symbol,
          status: "failed",
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      pushToast("error", getFriendlyError(error));
    } finally {
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (!walletAddress) return;
    void refreshFromChain(walletAddress);
  }, [walletAddress, selectedAsset.contractId]);

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-6 font-body text-white sm:px-6 lg:px-8">
      <header className="glass-card sticky top-4 z-20 mb-8 animate-fade-up p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold">Ghost-Author</p>
            <p className="text-sm text-white/65">
              Real-time IP Royalty Splitter on Stellar
            </p>
          </div>

          <div className="flex items-center gap-3">
            {walletAddress ? (
              <div className="glass-card flex items-center gap-3 px-3 py-2">
                <span className="badge border-mint/50 bg-mint/20 text-mint">
                  Live
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    {shortAddress(walletAddress)}
                  </p>
                  <p className="text-xs text-white/60">
                    {Number(xlmBalance).toFixed(2)} XLM
                  </p>
                </div>
              </div>
            ) : null}

            <button
              className="neon-button"
              disabled={isConnecting}
              onClick={handleConnectWallet}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting
                ? "Connecting..."
                : walletAddress
                  ? "Reconnect"
                  : "Connect Wallet"}
            </button>
          </div>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-2">
        <section className="glass-card animate-fade-up space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-cyber" />
              <h2 className="font-display text-lg">Creator Studio</h2>
            </div>
            <span
              className={`badge ${totalPercentOk ? "border-mint/50 bg-mint/20 text-mint" : "border-warning/40 bg-warning/20 text-warning"}`}
            >
              Total {totalPercent.toFixed(2)}%
            </span>
          </div>

          <div className="space-y-3">
            {collaborators.map((row) => {
              const bps = percentToBps(row.percent);
              return (
                <div
                  key={row.id}
                  className="grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:grid-cols-12"
                >
                  <div className="sm:col-span-7">
                    <input
                      className="input"
                      placeholder="G... address"
                      value={row.address}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCollaborators((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, address: value }
                              : item,
                          ),
                        );
                      }}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      className="input"
                      placeholder="0.00"
                      value={row.percent}
                      onChange={(event) => {
                        const value = event.target.value;
                        setCollaborators((prev) =>
                          prev.map((item) =>
                            item.id === row.id
                              ? { ...item, percent: value }
                              : item,
                          ),
                        );
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between gap-2 text-xs text-white/60 sm:justify-end">
                    <span>{bps} bps</span>
                    <button
                      className="rounded-md border border-white/15 px-2 py-1 text-white/80 hover:border-white/30"
                      disabled={collaborators.length <= 1}
                      onClick={() =>
                        setCollaborators((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10"
              onClick={() => setCollaborators((prev) => [...prev, makeRow()])}
            >
              Add Collaborator
            </button>
            <p className="text-xs text-white/60">
              Auto converter: 25.5% = 2550 bps
            </p>
          </div>

          <button
            className="neon-button w-full"
            disabled={!walletAddress || !formValid || isDeploying}
            onClick={handleDeploy}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isDeploying ? "Deploying..." : "Deploy / Update Royalty Config"}
          </button>
        </section>

        <section className="glass-card animate-fade-up space-y-4 p-5 [animation-delay:80ms]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-mint" />
            <h2 className="font-display text-lg">Payer Interface</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="input"
              placeholder="Amount"
              value={payAmount}
              onChange={(event) => setPayAmount(event.target.value)}
            />

            <select
              className="input"
              value={selectedAsset.symbol}
              onChange={(event) =>
                setSelectedAssetSymbol(event.target.value as "XLM" | "USDC")
              }
            >
              {ASSET_OPTIONS.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.symbol}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="mb-2 text-sm font-semibold text-white/80">
              Payout Preview
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1 text-sm text-white/75">
              {estimatedPayouts.length === 0 ? (
                <p className="text-white/50">
                  Masukkan amount untuk melihat estimasi payout.
                </p>
              ) : (
                estimatedPayouts.map((item) => (
                  <div
                    key={item.address}
                    className="flex items-center justify-between"
                  >
                    <span>{shortAddress(item.address)}</span>
                    <span>
                      {item.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 7,
                      })}{" "}
                      {selectedAsset.symbol}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            className="neon-button w-full"
            disabled={!walletAddress || isPaying}
            onClick={handlePay}
          >
            {isPaying ? "Processing Payment..." : "Pay Royalty"}
          </button>
        </section>
      </main>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="glass-card p-4">
          <p className="text-sm text-white/60">Total Revenue Processed</p>
          <p className="mt-2 font-display text-2xl font-semibold text-mint">
            {formatCurrency(totalRevenueAtomic, selectedAsset.decimals)}{" "}
            {selectedAsset.symbol}
          </p>
        </article>
        <article className="glass-card p-4">
          <p className="text-sm text-white/60">Total Participants</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {activeShareholders.length}
          </p>
        </article>
        <article className="glass-card p-4">
          <p className="text-sm text-white/60">Last Payment</p>
          <p className="mt-2 text-sm font-medium">
            {formatDate(lastPaymentAt)}
          </p>
          {isRefreshing ? (
            <p className="mt-1 text-xs text-white/50">
              Syncing on-chain data...
            </p>
          ) : null}
        </article>
      </section>

      <section className="glass-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h3 className="font-display text-base font-semibold">
            Transaction Table
          </h3>
          <span className="text-xs text-white/50">
            Latest {records.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Hash</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-white/45"
                    colSpan={5}
                  >
                    Belum ada transaksi pada sesi ini.
                  </td>
                </tr>
              ) : (
                records.map((row) => (
                  <tr key={row.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white/75">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{row.amount}</td>
                    <td className="px-4 py-3">{row.asset}</td>
                    <td className="px-4 py-3">
                      {row.hash === "-" ? (
                        "-"
                      ) : (
                        <a
                          className="text-cyber underline-offset-4 hover:underline"
                          href={`https://stellar.expert/explorer/${import.meta.env.VITE_STELLAR_EXPERT_NETWORK ?? "testnet"}/tx/${row.hash}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {shortAddress(row.hash)}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          row.status === "success"
                            ? "border-mint/50 bg-mint/20 text-mint"
                            : "border-danger/40 bg-danger/20 text-danger"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm backdrop-blur-sm ${
              toast.kind === "success"
                ? "border-mint/40 bg-mint/20"
                : toast.kind === "error"
                  ? "border-danger/40 bg-danger/20"
                  : "border-cyber/45 bg-cyber/20"
            }`}
          >
            <p>{toast.message}</p>
            {toast.link ? (
              <a
                className="mt-1 inline-block text-xs text-white/90 underline underline-offset-4"
                href={toast.link}
                rel="noreferrer"
                target="_blank"
              >
                Open in Stellar Expert
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
