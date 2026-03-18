import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { explorerUrl, VALID_CHAINS, validateWalletAddress, type Chain } from "../validators.js";

interface TradeData {
  txId: string;
  status: string;
  statusDesc?: string;
  chain?: string;
  tokenAddress?: string;
  walletAddress?: string;
  isBuy?: boolean;
  baseAmount?: number;
  quoteAmount?: number;
  [key: string]: unknown;
}

interface TradeRecord {
  txId: string;
  status: number;
  statusDesc: string;
  chain: string;
  tokenAddress: string;
  walletAddress: string;
  isBuy: number;
  baseAmount: number;
  quoteAmount: number;
  createTime: string;
  updateTime: string;
}

interface TradesData {
  pageNum: number;
  pageSize: number;
  total: number;
  list: TradeRecord[];
}

function isKnownChain(chain: string): chain is Chain {
  return (VALID_CHAINS as readonly string[]).includes(chain);
}

export function registerTradeTools(server: McpServer) {
  server.tool(
    "query_trade",
    "Query the status of a transaction by its ID.",
    {
      txId: z.string().describe("Transaction ID to query"),
    },
    async ({ txId }) => {
      try {
        const client = getClient();
        const res = await client.get<TradeData>("/api/trade/open/api/trade", {
          txId,
        });

        if (!res.success || !res.data) {
          return errorResult(`Query failed: ${res.msg}`);
        }

        const d = res.data;

        const lines = [
          `Transaction: ${d.txId}`,
          `Status: ${d.status}${d.statusDesc ? ` (${d.statusDesc})` : ""}`,
          `Chain: ${d.chain || "Unknown"}`,
          `Type: ${d.isBuy === true ? "Buy" : d.isBuy === false ? "Sell" : "Unknown"}`,
        ];
        if (d.tokenAddress) lines.push(`Token: ${d.tokenAddress}`);
        if (d.walletAddress) lines.push(`Wallet: ${d.walletAddress}`);
        if (d.baseAmount !== undefined)
          lines.push(`Base Amount: ${d.baseAmount}`);
        if (d.quoteAmount !== undefined)
          lines.push(`Quote Amount: ${d.quoteAmount}`);
        if (d.chain && isKnownChain(d.chain)) {
          lines.push(`Explorer: ${explorerUrl(d.chain, d.txId)}`);
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "ping",
    "Verify XXYY API Key validity. Returns 'pong' if the key is valid.",
    {},
    async () => {
      try {
        const client = getClient();
        const res = await client.get<string>("/api/trade/open/api/ping");

        if (res.success) {
          return textResult("pong — API Key is valid.");
        }
        return errorResult(`Ping failed: ${res.msg}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "list_trades",
    "Query successful trade history for a specific wallet. Returns paginated trade records sorted by creation time (newest first). Only completed transactions are returned.",
    {
      walletAddress: z
        .string()
        .describe("Wallet address (must belong to current API Key user)"),
      chain: z
        .enum(VALID_CHAINS)
        .describe("Blockchain network (required)"),
      tokenAddress: z
        .string()
        .optional()
        .describe("Filter by token contract address"),
      pageNum: z
        .number()
        .int()
        .min(1)
        .default(1)
        .optional()
        .describe("Page number, starting from 1"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(20)
        .default(20)
        .optional()
        .describe("Items per page, max 20"),
    },
    async ({ walletAddress, chain, tokenAddress, pageNum, pageSize }) => {
      try {
        validateWalletAddress(walletAddress, chain);

        const client = getClient();
        const params: Record<string, string> = { walletAddress, chain };
        if (tokenAddress) params.tokenAddress = tokenAddress;
        if (pageNum !== undefined) params.pageNum = String(pageNum);
        if (pageSize !== undefined) params.pageSize = String(pageSize);

        const res = await client.get<TradesData>(
          "/api/trade/open/api/trades",
          params,
        );

        if (!res.success || !res.data) {
          return errorResult(`Trade history query failed: ${res.msg}`);
        }

        const d = res.data;

        if (!d.list || d.list.length === 0) {
          return textResult(
            `No trade records found for wallet ${walletAddress} on ${chain.toUpperCase()}.`,
          );
        }

        const lines: string[] = [
          `Trade History — ${chain.toUpperCase()} (${d.total} total, page ${d.pageNum}/${Math.ceil(d.total / d.pageSize)})`,
          "──────────────────────────────",
          "",
        ];

        for (const t of d.list) {
          const side = t.isBuy === 1 ? "Buy" : "Sell";
          const link =
            t.chain && isKnownChain(t.chain)
              ? explorerUrl(t.chain as Chain, t.txId)
              : t.txId;
          lines.push(
            `[${side}] ${t.tokenAddress}`,
            `  Amount: ${t.baseAmount} (quote: ${t.quoteAmount})`,
            `  Time: ${t.createTime}`,
            `  Tx: ${link}`,
            "",
          );
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
