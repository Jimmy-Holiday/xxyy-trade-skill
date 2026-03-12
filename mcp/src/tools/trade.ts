import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { explorerUrl, VALID_CHAINS, type Chain } from "../validators.js";

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
}
