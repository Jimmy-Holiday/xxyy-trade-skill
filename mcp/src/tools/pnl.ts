import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { VALID_CHAINS, NATIVE_TOKEN, validateWalletAddress, validateContractAddress } from "../validators.js";

interface PnlMeta {
  symbol: string;
  dexId?: string;
  dexIcon?: string;
  imageUrl?: string;
  pairAddress?: string;
}

interface PnlData {
  wallet: string | null;
  tokenMint: string;
  balance: number | null;
  buy: number;
  sell: number;
  hold: number | null;
  pnl: number | null;
  pnlusd: number | null;
  holdTokenNum: number;
  holdTokenPercent: number;
  lastTradeTime: number | null;
  meta?: PnlMeta | null;
}

export function registerPnlTools(server: McpServer) {
  server.tool(
    "pnl_query",
    "Query PNL (profit and loss) for a specific wallet-token pair. Returns buy/sell totals, current holdings, and profit in both native currency and USD.",
    {
      walletAddress: z
        .string()
        .describe("Wallet address (must belong to current API Key user)"),
      tokenAddress: z
        .string()
        .describe("Token contract address"),
      chain: z
        .enum(VALID_CHAINS)
        .describe("Blockchain network (required)"),
    },
    async ({ walletAddress, tokenAddress, chain }) => {
      try {
        validateWalletAddress(walletAddress, chain);
        validateContractAddress(tokenAddress, chain);

        const client = getClient();
        const res = await client.get<PnlData>(
          "/api/trade/open/api/pnl",
          { walletAddress, tokenAddress, chain },
        );

        if (!res.success || !res.data) {
          return errorResult(`PNL query failed: ${res.msg}`);
        }

        const d = res.data;
        const native = NATIVE_TOKEN[chain];
        const symbol = d.meta?.symbol ?? "TOKEN";

        const lines: string[] = [
          `PNL — ${symbol} on ${chain.toUpperCase()}`,
          "──────────────────────────────",
          "",
          `Token: ${d.tokenMint}`,
        ];

        if (d.wallet) lines.push(`Wallet: ${d.wallet}`);
        if (d.balance != null) lines.push(`Wallet Balance: ${d.balance} ${native}`);

        lines.push(
          "",
          "── Trade Summary ──",
          `  Total Buy: ${d.buy} ${native}`,
          `  Total Sell: ${d.sell} ${native}`,
          `  Current Hold Value: ${d.hold != null ? `${d.hold} ${native}` : "N/A"}`,
          "",
          "── Profit / Loss ──",
        );

        if (d.pnl != null) {
          const pnlSign = d.pnl >= 0 ? "+" : "";
          lines.push(`  PNL: ${pnlSign}${d.pnl} ${native}`);
        } else {
          lines.push("  PNL: N/A");
        }
        if (d.pnlusd != null) {
          const pnlUsdSign = d.pnlusd >= 0 ? "+" : "";
          lines.push(`  PNL (USD): ${pnlUsdSign}$${d.pnlusd}`);
        } else {
          lines.push("  PNL (USD): N/A");
        }

        lines.push(
          "",
          "── Holdings ──",
          `  Token Amount: ${d.holdTokenNum}`,
          `  Supply %: ${d.holdTokenPercent}%`,
        );

        if (d.lastTradeTime != null && d.lastTradeTime > 0) {
          lines.push(
            `  Last Trade: ${new Date(d.lastTradeTime).toISOString()}`,
          );
        }

        if (d.meta?.dexId) {
          lines.push("", `DEX: ${d.meta.dexId}`);
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
