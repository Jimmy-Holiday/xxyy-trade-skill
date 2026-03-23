import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchAndFormatTokenList } from "./token-list-common.js";

const SUPPORTED_CHAINS = ["sol"] as const;
const SUPPORTED_SIGNAL_TYPES = ["open-ai-trending"] as const;

export function registerSignalTools(server: McpServer) {
  server.tool(
    "signal_list",
    "Get AI trend signal list (e.g., open-ai-trending tokens)",
    {
      type: z
        .enum(SUPPORTED_SIGNAL_TYPES)
        .optional()
        .default("open-ai-trending")
        .describe("Signal type, currently only supports open-ai-trending"),
      chain: z
        .enum(SUPPORTED_CHAINS)
        .optional()
        .default("sol")
        .describe("Chain type, currently only supports sol"),
    },
    async ({ type, chain }) => {
      const url = `/api/trade/open/api/signal-list?type=${type}&chain=${chain}`;
      return fetchAndFormatTokenList(
        url,
        "POST",
        {},
        `AI Trend Signals - ${type}`,
        `No ${type} signals found on ${chain.toUpperCase()}.`,
      );
    },
  );
}
