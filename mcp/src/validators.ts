export const VALID_CHAINS = ["sol", "eth", "bsc", "base"] as const;
export const FEED_CHAINS = ["sol", "bsc"] as const;

export type Chain = (typeof VALID_CHAINS)[number];
export type FeedChain = (typeof FEED_CHAINS)[number];

export const NATIVE_TOKEN: Record<Chain, string> = {
  sol: "SOL",
  eth: "ETH",
  bsc: "BNB",
  base: "ETH",
};

const SOL_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

const TIP_RANGES: Record<Chain, { min: number; max: number; unit: string }> = {
  sol: { min: 0.0001, max: 0.1, unit: "SOL" },
  eth: { min: 0.1, max: 100, unit: "Gwei" },
  bsc: { min: 0.1, max: 100, unit: "Gwei" },
  base: { min: 0.1, max: 100, unit: "Gwei" },
};

export function validateWalletAddress(address: string, chain: Chain): void {
  if (chain === "sol") {
    if (!SOL_ADDRESS_RE.test(address)) {
      throw new Error(
        `Invalid Solana wallet address. Expected Base58, 32-44 characters. Got: "${address}"`,
      );
    }
  } else {
    if (!EVM_ADDRESS_RE.test(address)) {
      throw new Error(
        `Invalid EVM wallet address for ${chain}. Expected 0x + 40 hex characters. Got: "${address}"`,
      );
    }
  }
}

export function validateContractAddress(address: string, chain: Chain): void {
  if (chain === "sol") {
    if (!SOL_ADDRESS_RE.test(address)) {
      throw new Error(
        `Invalid Solana contract address. Expected Base58, 32-44 characters. Got: "${address}"`,
      );
    }
  } else {
    if (!EVM_ADDRESS_RE.test(address)) {
      throw new Error(
        `Invalid EVM contract address for ${chain}. Expected 0x + 40 hex characters. Got: "${address}"`,
      );
    }
  }
}

export function validateTip(tip: number, chain: Chain): string | null {
  const range = TIP_RANGES[chain];
  if (tip < range.min || tip > range.max) {
    return (
      `Warning: tip ${tip} is outside the recommended range ` +
      `(${range.min}-${range.max} ${range.unit} for ${chain}). ` +
      `This may result in unexpectedly high costs or failed transactions.`
    );
  }
  return null;
}

const EXPLORER_URLS: Record<Chain, string> = {
  sol: "https://solscan.io/tx/",
  eth: "https://etherscan.io/tx/",
  bsc: "https://bscscan.com/tx/",
  base: "https://basescan.org/tx/",
};

export function explorerUrl(chain: Chain, txId: string): string {
  return EXPLORER_URLS[chain] + txId;
}
