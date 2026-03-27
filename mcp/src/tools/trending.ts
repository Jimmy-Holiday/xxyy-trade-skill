import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { FEED_CHAINS } from "../validators.js";
const SUPPORTED_PERIODS = ["1M", "5M", "30M", "1H", "6H", "24H"] as const;

interface TrendingItem {
  imageUrl: string;
  createTime: string;
  symbol: string;
  name: string;
  dexId: string;
  pairAddress: string;
  tokenAddress: string;
  priceUSD: string;
  priceChange24H: string;
  launchPlatform: {
    name: string | null;
    progress: number | null;
    completed: boolean | null;
    launchedPair: string | null;
  } | null;
  dexName: string;
  dexIcon: string;
  marketCapUSD: string;
  links: { tg: string; x: string; web: string };
  security: {
    mintAuthority: { value: boolean; passed: boolean };
    freezeAuthority: { value: boolean; passed: boolean };
    topHolder: { value: number; passed: boolean };
    lpBurned: { value: number; passed: boolean };
  };
  holders: number;
  devHoldPercent: string;
  smartWallets: {
    total: number;
    records: { wallet: string; action: string; nativeAmount: string }[];
  } | null;
  sourceDexIcon: string;
  launchFrom: string;
  extendFlags: { live: boolean };
  volume: number;
  liquid: number;
  buyCount: number;
  sellCount: number;
  auditInfo: {
    devHp: number;
    snipers: number;
    insiderHp: number;
    newHp: number;
    bundleHp: number;
    dexPaid: boolean;
  };
}

const TRENDING_ITEM_LIMIT = 50;

function formatSecurity(sec: TrendingItem["security"]): string {
  const items: string[] = [];
  items.push(`Mint: ${sec.mintAuthority.passed ? "✅" : "❌"}`);
  items.push(`Freeze: ${sec.freezeAuthority.passed ? "✅" : "❌"}`);
  items.push(`Top10: ${sec.topHolder.value}% ${sec.topHolder.passed ? "✅" : "⚠️"}`);
  items.push(`LP Burned: ${sec.lpBurned.value}% ${sec.lpBurned.passed ? "✅" : "⚠️"}`);
  return items.join(" | ");
}

function formatTrendingItem(item: TrendingItem, idx: number): string {
  const priceChange = parseFloat(item.priceChange24H);
  const changeIndicator = priceChange >= 0 ? "📈" : "📉";

  const lines = [
    `[${idx + 1}] ${item.symbol} - ${item.name || "N/A"}`,
    `  Token: ${item.tokenAddress}`,
    `  Price: $${parseFloat(item.priceUSD).toFixed(10)}`,
    `  Market Cap: $${parseFloat(item.marketCapUSD).toLocaleString()}`,
    `  24h Change: ${changeIndicator} ${item.priceChange24H}%`,
    `  Volume: $${item.volume?.toLocaleString() ?? "N/A"}`,
    `  Liquidity: $${item.liquid?.toLocaleString() ?? "N/A"}`,
    `  Buys/Sells: ${item.buyCount ?? 0} / ${item.sellCount ?? 0}`,
    `  Holders: ${item.holders ?? "N/A"} | Dev Hold: ${item.devHoldPercent ?? "N/A"}%`,
    `  DEX: ${item.dexName} (${item.launchFrom || "N/A"})`,
  ];

  if (item.security) {
    lines.push(`  Security: ${formatSecurity(item.security)}`);
  }

  if (item.launchPlatform?.name) {
    lines.push(
      `  Platform: ${item.launchPlatform.name} | Progress: ${item.launchPlatform.progress ?? "N/A"}% | Completed: ${item.launchPlatform.completed}`,
    );
  }

  if (item.smartWallets && item.smartWallets.total > 0) {
    lines.push(`  Smart Wallets: ${item.smartWallets.total} bought`);
  }

  if (item.auditInfo) {
    const a = item.auditInfo;
    lines.push(
      `  Audit: Snipers=${a.snipers} DevHp=${a.devHp}% InsiderHp=${a.insiderHp}% BundleHp=${a.bundleHp}% DexPaid=${a.dexPaid}`,
    );
  }

  if (item.links?.x || item.links?.tg || item.links?.web) {
    const linkParts = [];
    if (item.links.x) linkParts.push(`X: ${item.links.x}`);
    if (item.links.tg) linkParts.push(`TG: ${item.links.tg}`);
    if (item.links.web) linkParts.push(`Web: ${item.links.web}`);
    lines.push(`  Links: ${linkParts.join(" | ")}`);
  }

  if (item.extendFlags?.live) {
    lines.push(`  🔴 LIVE`);
  }

  return lines.join("\n");
}

export function registerTrendingTools(server: McpServer) {
  server.tool(
    "trending_list",
    "Get trending/hot token list. Shows the most active tokens by period. Supports SOL and BSC chains.",
    {
      period: z
        .enum(SUPPORTED_PERIODS)
        .describe(
          "Time period for trending: 1M, 5M, 30M, 1H, 6H, 24H. Not all periods available for all categories.",
        ),
      chain: z
        .enum(FEED_CHAINS)
        .optional()
        .default("sol")
        .describe("Chain type, supports sol and bsc"),
    },
    async ({ period, chain }) => {
      try {
        const client = getClient();
        const res = await client.post<TrendingItem[]>(
          "/api/trade/open/api/trending-list",
          { period },
          { chain },
        );

        if (res.code !== 200 || !res.data) {
          return errorResult(`API error: ${res.msg} (code: ${res.code})`);
        }

        const allItems = res.data;
        if (allItems.length === 0) {
          return textResult(
            `No trending tokens found for period=${period} on ${chain.toUpperCase()}.`,
          );
        }

        const items = allItems.slice(0, TRENDING_ITEM_LIMIT);
        const truncated = allItems.length > TRENDING_ITEM_LIMIT;

        const header = `🔥 Trending Tokens (${period}) on ${chain.toUpperCase()} — ${items.length} of ${allItems.length} token(s)\n${"─".repeat(50)}`;
        const body = items
          .map((item, idx) => formatTrendingItem(item, idx))
          .join("\n\n");
        const footer = truncated
          ? `\n\n... ${allItems.length - TRENDING_ITEM_LIMIT} more tokens not shown.`
          : "";

        return textResult(`${header}\n\n${body}${footer}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
