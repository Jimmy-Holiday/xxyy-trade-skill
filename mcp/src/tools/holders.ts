import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { VALID_CHAINS } from "../validators.js";

const HOLDER_TYPES = ["top", "follow", "kol", "insider"] as const;

interface HolderItem {
  address: string;
  name: string | null;
  holdAmount: string;
  holdPercent: string;
  holdValueNative: string;
  holdValueUSD: string;
  tags: string[];
  tradeCount: number | null;
  buyCount: number | null;
  sellCount: number | null;
  profitNative: number | null;
  profitUSD: number | null;
  profitPercent: number | null;
  tokenSourceType: number | null;
  nativeBalance: number;
}

function formatHolder(h: HolderItem, index: number): string {
  const addr = h.name
    ? `${h.name} (${h.address.slice(0, 6)}...${h.address.slice(-4)})`
    : `${h.address.slice(0, 6)}...${h.address.slice(-4)}`;
  const tags = h.tags.length > 0 ? ` [${h.tags.join(", ")}]` : "";
  const source = h.tokenSourceType === 1 ? "Bought" : h.tokenSourceType === 2 ? "Transfer" : "—";

  const lines = [
    `${index + 1}. ${addr}${tags}`,
    `   Hold: ${h.holdPercent}% | $${h.holdValueUSD} (${h.holdValueNative} native)`,
  ];

  if (h.tradeCount != null) {
    lines.push(`   Trades: ${h.tradeCount} (${h.buyCount ?? 0}B/${h.sellCount ?? 0}S) | Source: ${source}`);
  } else {
    lines.push(`   Source: ${source}`);
  }

  if (h.profitPercent != null) {
    const sign = h.profitPercent >= 0 ? "+" : "";
    lines.push(`   PnL: ${sign}${h.profitPercent}% ($${h.profitUSD?.toFixed(2) ?? "—"})`);
  }

  return lines.join("\n");
}

export function registerHolderTools(server: McpServer) {
  server.tool(
    "token_holders",
    "Query token holder list. Returns top holders, followed wallet holders, KOL holders, or insider holders for a given token. Useful for analyzing token distribution and whale activity.",
    {
      type: z
        .enum(HOLDER_TYPES)
        .describe(
          "Holder type: 'top' (top 20 holders), 'follow' (your followed wallets), 'kol' (KOL wallets), 'insider' (insider wallets)",
        ),
      mint: z
        .string()
        .optional()
        .describe("Token contract address"),
      pair: z
        .string()
        .optional()
        .describe("Pool/pair address"),
      wallet: z
        .string()
        .optional()
        .describe("Filter by specific wallet address"),
      chain: z
        .enum(VALID_CHAINS)
        .default("sol")
        .describe("Blockchain network, default sol"),
    },
    async ({ type, mint, pair, wallet, chain }) => {
      try {
        const client = getClient();
        const params: Record<string, string> = { chain };
        if (mint) params.mint = mint;
        if (pair) params.pair = pair;
        if (wallet) params.wallet = wallet;

        const res = await client.get<HolderItem[]>(
          `/api/trade/open/api/holders/${type}`,
          params,
        );

        if (!res.success || !res.data) {
          return errorResult(`Holder query failed: ${res.msg}`);
        }

        if (res.data.length === 0) {
          return textResult(`No ${type} holders found for this token.`);
        }

        const typeLabel = {
          top: "Top Holders",
          follow: "Followed Wallet Holders",
          kol: "KOL Holders",
          insider: "Insider Holders",
        }[type];

        const lines: string[] = [
          `${typeLabel} — ${res.data.length} holder(s) on ${chain.toUpperCase()}`,
          "──────────────────────────────",
          "",
        ];

        res.data.forEach((h, i) => {
          lines.push(formatHolder(h, i));
          lines.push("");
        });

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
