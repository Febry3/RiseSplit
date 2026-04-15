const CONTRACT_ERROR_COPY: Record<string, string> = {
  InvalidPercentageSum: "Total persentase harus tepat 100%.",
  InsufficientPayment: "Jumlah pembayaran terlalu kecil untuk dibagi.",
  UnauthorizedAccess: "Hanya pemilik kontrak yang bisa mengubah konfigurasi.",
  NotInitialized: "Kontrak belum diinisialisasi. Jalankan deploy terlebih dulu.",
};

const WALLET_ERROR_COPY: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /extension belum terpasang|not connected|not installed|freighter extension/i,
    message: "Freighter belum terpasang/aktif. Install lalu reload browser.",
  },
  {
    pattern: /declined|rejected|ditolak|denied/i,
    message: "Koneksi wallet ditolak. Klik Connect Wallet lalu approve di Freighter.",
  },
  {
    pattern: /network mismatch|switch freighter ke testnet/i,
    message: "Network Freighter harus Testnet.",
  },
  {
    pattern: /popup|closed|cancel/i,
    message: "Popup Freighter ditutup. Coba connect lagi dan jangan tutup popup.",
  },
];

const NUMERIC_ERROR_COPY: Record<number, string> = {
  1: CONTRACT_ERROR_COPY.InvalidPercentageSum,
  2: CONTRACT_ERROR_COPY.InsufficientPayment,
  3: CONTRACT_ERROR_COPY.UnauthorizedAccess,
  4: CONTRACT_ERROR_COPY.NotInitialized,
};

export const getFriendlyError = (raw: unknown): string => {
  const input = String(raw ?? "");

  for (const [code, message] of Object.entries(CONTRACT_ERROR_COPY)) {
    if (input.includes(code)) {
      return message;
    }
  }

  for (const [code, message] of Object.entries(NUMERIC_ERROR_COPY)) {
    if (input.includes(`Error(Contract, #${code})`) || input.includes(`error ${code}`)) {
      return message;
    }
  }

  for (const entry of WALLET_ERROR_COPY) {
    if (entry.pattern.test(input)) {
      return entry.message;
    }
  }

  return input || "Terjadi error saat memproses transaksi. Coba lagi.";
};
