import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { VALID_CHAINS, validateContractAddress, type Chain } from "../validators.js";

interface TokenData {
  chainId: string;
  tokenAddress: string;
  baseSymbol: string;
  tradeInfo?: {
    marketCapUsd: number;
    price: number;
    holder: number;
    hourTradeNum: number;
    hourTradeVolume: number;
  };
  pairInfo?: {
    pairAddress: string;
    pair: string;
    liquidateUsd: number;
    createTime: number;
  };
  securityInfo?: {
    honeyPot: boolean;
    openSource: boolean;
    noOwner: boolean;
    locked: boolean;
  };
  taxInfo?: {
    buy: string;
    sell: string;
  };
  linkInfo?: {
    tg: string;
    x: string;
    web: string;
  };
  dev?: {
    address: string;
    pct: number;
  };
  topHolderPct?: number;
  topHolderList?: Array<{
    address: string;
    balance: number;
    pct: number;
  }>;
  [key: string]: unknown;
}

export function registerQueryTools(server: McpServer) {
  server.tool(
    "token_query",
    "Query token details: price, security checks, tax rates, holder distribution, and social links.",
    {
      ca: z.string().describe("Token contract address"),
      chain: z
        .enum(VALID_CHAINS)
        .default("sol")
        .describe("Blockchain network, default sol"),
    },
    async ({ ca, chain }) => {
      try {
        validateContractAddress(ca, chain as Chain);

        const client = getClient();
        const res = await client.get<TokenData>(
          "/api/trade/open/api/query",
          { ca, chain },
        );

        if (!res.success || !res.data) {
          return errorResult(`Token query failed: ${res.msg}`);
        }

        const d = res.data;
        const warnings: string[] = [];

        // HoneyPot check
        if (d.securityInfo?.honeyPot) {
          warnings.push(
            "🚨 HONEYPOT DETECTED — This token is a honeypot! You will NOT be able to sell it. Trading is extremely risky!",
          );
        }

        // High tax check
        const buyTax = parseFloat(d.taxInfo?.buy ?? "0");
        const sellTax = parseFloat(d.taxInfo?.sell ?? "0");
        if (buyTax > 5) {
          warnings.push(
            `⚠️ High buy tax: ${buyTax}% — Significant portion of your purchase will be lost to tax.`,
          );
        }
        if (sellTax > 5) {
          warnings.push(
            `⚠️ High sell tax: ${sellTax}% — Significant portion of your sale will be lost to tax.`,
          );
        }

        const lines: string[] = [];

        // Warnings first
        if (warnings.length > 0) {
          lines.push(...warnings, "");
        }

        // Basic info
        lines.push(
          `Token: ${d.baseSymbol} (${d.chainId})`,
          `Contract: ${d.tokenAddress}`,
          "",
        );

        // Trade info
        if (d.tradeInfo) {
          lines.push(
            "── Trade Info ──",
            `  Price: $${d.tradeInfo.price}`,
            `  Market Cap: $${d.tradeInfo.marketCapUsd?.toLocaleString() ?? "N/A"}`,
            `  Holders: ${d.tradeInfo.holder ?? "N/A"}`,
            `  1h Trades: ${d.tradeInfo.hourTradeNum ?? "N/A"}`,
            `  1h Volume: $${d.tradeInfo.hourTradeVolume?.toLocaleString() ?? "N/A"}`,
            "",
          );
        }

        // Security info
        if (d.securityInfo) {
          const s = d.securityInfo;
          lines.push(
            "── Security Check ──",
            `  HoneyPot: ${s.honeyPot ? "YES ⛔" : "No ✓"}`,
            `  Open Source: ${s.openSource ? "Yes ✓" : "No ⚠"}`,
            `  No Owner: ${s.noOwner ? "Yes ✓" : "No ⚠"}`,
            `  Liquidity Locked: ${s.locked ? "Yes ✓" : "No ⚠"}`,
            "",
          );
        }

        // Tax info
        if (d.taxInfo) {
          lines.push(
            "── Tax Rates ──",
            `  Buy Tax: ${d.taxInfo.buy}%`,
            `  Sell Tax: ${d.taxInfo.sell}%`,
            "",
          );
        }

        // Dev info
        if (d.dev && d.dev.address) {
          lines.push(
            "── Developer ──",
            `  Address: ${d.dev.address}`,
            `  Holding: ${d.dev.pct ?? "N/A"}%`,
            "",
          );
        }

        // Top holders
        if (d.topHolderPct !== undefined) {
          lines.push(`── Top Holders (${d.topHolderPct}% total) ──`);
          if (d.topHolderList) {
            for (const h of d.topHolderList.slice(0, 5)) {
              lines.push(`  ${h.address}: ${h.pct}%`);
            }
            if (d.topHolderList.length > 5) {
              lines.push(`  ... and ${d.topHolderList.length - 5} more`);
            }
          }
          lines.push("");
        }

        // Links
        if (d.linkInfo) {
          const links: string[] = [];
          if (d.linkInfo.x) links.push(`Twitter: ${d.linkInfo.x}`);
          if (d.linkInfo.tg) links.push(`Telegram: ${d.linkInfo.tg}`);
          if (d.linkInfo.web) links.push(`Website: ${d.linkInfo.web}`);
          if (links.length > 0) {
            lines.push("── Social Links ──", ...links.map((l) => `  ${l}`));
          }
        }

        // Pair info
        if (d.pairInfo) {
          lines.push(
            "",
            "── Pair Info ──",
            `  Pair: ${d.pairInfo.pair}`,
            `  Liquidity: $${d.pairInfo.liquidateUsd?.toLocaleString() ?? "N/A"}`,
          );
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
