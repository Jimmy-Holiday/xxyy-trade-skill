import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { FEED_CHAINS } from "../validators.js";

interface FeedItem {
  tokenAddress: string;
  symbol: string;
  name: string;
  createTime: number;
  dexName?: string;
  launchPlatform?: { name: string; progress: string; completed: boolean };
  holders: number;
  priceUSD: number;
  marketCapUSD: number;
  devHoldPercent?: number;
  hasLink?: boolean;
  snipers?: number;
  volume?: number;
  tradeCount?: number;
  buyCount?: number;
  sellCount?: number;
  topHolderPercent?: number;
  quoteToken?: string;
  [key: string]: unknown;
}

interface FeedData {
  items: FeedItem[];
}

const FEED_ITEM_LIMIT = 50;

const filtersSchema = z
  .object({
    dex: z.array(z.string()).optional(),
    quoteTokens: z.array(z.string()).optional(),
    link: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    ignoreWords: z.array(z.string()).optional(),
    mc: z
      .string()
      .optional()
      .describe("Market cap range (USD), e.g. '10000,500000'"),
    liq: z.string().optional().describe("Liquidity range (USD)"),
    vol: z.string().optional().describe("Trading volume range (USD)"),
    holder: z.string().optional().describe("Holder count range"),
    createTime: z
      .string()
      .optional()
      .describe("Creation time range (minutes from now)"),
    tradeCount: z.string().optional(),
    buyCount: z.string().optional(),
    sellCount: z.string().optional(),
    devBuy: z.string().optional(),
    devSell: z.string().optional(),
    devHp: z.string().optional().describe("Dev holding % range"),
    topHp: z.string().optional().describe("Top10 holding % range"),
    insiderHp: z.string().optional().describe("Insider holding % range"),
    bundleHp: z.string().optional().describe("Bundle holding % range"),
    newWalletHp: z.string().optional().describe("New wallet holding % range"),
    progress: z.string().optional().describe("Graduation progress % range"),
    snipers: z.string().optional(),
    xnameCount: z.string().optional(),
    tagHolder: z
      .string()
      .optional()
      .describe("Watched wallet buy count range"),
    kol: z.string().optional().describe("KOL buy count range"),
    dexPay: z
      .number()
      .int()
      .optional()
      .describe("DexScreener paid, 1=filter paid only"),
    oneLink: z
      .number()
      .int()
      .optional()
      .describe("At least one social link, 1=enabled"),
    live: z
      .number()
      .int()
      .optional()
      .describe("Currently live streaming, 1=filter live"),
  })
  .optional()
  .describe("Optional filters. Range params use 'min,max' format.");

function formatFeedItem(item: FeedItem): string {
  const lines = [
    `${item.symbol} (${item.name})`,
    `  Contract: ${item.tokenAddress}`,
    `  Price: $${item.priceUSD}`,
    `  Market Cap: $${item.marketCapUSD?.toLocaleString() ?? "N/A"}`,
    `  Holders: ${item.holders ?? "N/A"}`,
  ];
  if (item.devHoldPercent !== undefined)
    lines.push(`  Dev Hold: ${item.devHoldPercent}%`);
  if (item.launchPlatform)
    lines.push(
      `  Platform: ${item.launchPlatform.name} | Progress: ${item.launchPlatform.progress}% | Completed: ${item.launchPlatform.completed}`,
    );
  if (item.volume !== undefined)
    lines.push(`  Volume: $${item.volume.toLocaleString()}`);
  if (item.snipers !== undefined) lines.push(`  Snipers: ${item.snipers}`);
  return lines.join("\n");
}

export function registerFeedTools(server: McpServer) {
  server.tool(
    "feed_scan",
    "Scan Meme token lists: newly launched (NEW), almost graduated (ALMOST), or graduated (COMPLETED). Only supports SOL and BSC chains.",
    {
      type: z
        .enum(["NEW", "ALMOST", "COMPLETED"])
        .describe("Token list type: NEW / ALMOST / COMPLETED"),
      chain: z
        .enum(FEED_CHAINS)
        .default("sol")
        .describe("Chain to scan. Only sol and bsc supported."),
      filters: filtersSchema,
    },
    async ({ type, chain, filters }) => {
      try {
        const client = getClient();
        const res = await client.post<FeedData>(
          `/api/trade/open/api/feed/${type}`,
          filters ?? {},
          { chain },
        );

        if (!res.success || !res.data?.items) {
          return errorResult(`Feed scan failed: ${res.msg}`);
        }

        const allItems = res.data.items;
        if (allItems.length === 0) {
          return textResult(
            `No tokens found for type=${type} on ${chain} with the given filters.`,
          );
        }

        const items = allItems.slice(0, FEED_ITEM_LIMIT);
        const truncated = allItems.length > FEED_ITEM_LIMIT;

        const header = `Feed Scan: ${type} on ${chain.toUpperCase()} — showing ${items.length} of ${allItems.length} token(s)\n${"─".repeat(50)}`;
        const body = items.map(formatFeedItem).join("\n\n");
        const footer = truncated
          ? `\n\n... ${allItems.length - FEED_ITEM_LIMIT} more tokens not shown. Use filters to narrow results.`
          : "";

        return textResult(`${header}\n\n${body}${footer}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
