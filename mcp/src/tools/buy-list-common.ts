import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import type { FeedChain } from "../validators.js";

interface TokenMeta {
  symbol: string;
  mint: string;
  imageUrl?: string;
  pairAddress?: string;
}

interface WalletBuyItem {
  wallet: string;
  walletName: string;
  walletBuyAmount: number;
}

export interface BuyListToken {
  tokenMeta: TokenMeta;
  priceUsd: number;
  marketCap: number;
  walletBuyItemList: WalletBuyItem[];
  lastTradeTime?: number;
}

const MAX_TOKENS = 50;
const MAX_WALLETS_PER_TOKEN = 10;

export async function fetchAndFormatBuyList(
  endpoint: string,
  chain: FeedChain,
  actorLabel: string,
  emptyMessage: string,
) {
  try {
    const client = getClient();
    const url = `${endpoint}?chain=${chain}`;

    const response = await client.get<BuyListToken[]>(url);

    if (response.code !== 200) {
      return errorResult(
        `API error: ${response.msg} (code: ${response.code})`,
      );
    }

    const allTokens = response.data || [];
    if (allTokens.length === 0) {
      return textResult(emptyMessage);
    }

    const tokens = allTokens.slice(0, MAX_TOKENS);
    const lines: string[] = [];

    tokens.forEach((token, idx) => {
      const { tokenMeta, priceUsd, marketCap, walletBuyItemList } = token;

      lines.push(
        `[${idx + 1}] ${tokenMeta.symbol}`,
        `  Token: ${tokenMeta.mint}`,
        `  Price: $${priceUsd.toFixed(10)}`,
        `  Market Cap: $${marketCap.toLocaleString()}`,
      );

      const wallets = walletBuyItemList.slice(0, MAX_WALLETS_PER_TOKEN);
      lines.push(`  ${actorLabel} (${wallets.length}):`);

      wallets.forEach((wallet, wIdx) => {
        lines.push(
          `    ${wIdx + 1}. ${wallet.walletName} (${wallet.wallet})`,
          `       Buy Amount: ${wallet.walletBuyAmount.toFixed(4)} ${chain.toUpperCase()}`,
        );
      });

      if (walletBuyItemList.length > MAX_WALLETS_PER_TOKEN) {
        lines.push(
          `    ... and ${walletBuyItemList.length - MAX_WALLETS_PER_TOKEN} more`,
        );
      }

      lines.push("");
    });

    if (allTokens.length > MAX_TOKENS) {
      lines.push(
        `(Showing first ${MAX_TOKENS} of ${allTokens.length} tokens)`,
      );
    }

    return textResult(lines.join("\n").trim());
  } catch (error) {
    return errorResult(`Failed to fetch buy list: ${error}`);
  }
}
