import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FEED_CHAINS } from "../validators.js";
import { fetchAndFormatBuyList } from "./buy-list-common.js";

export function registerKolTools(server: McpServer) {
  server.tool(
    "kol_buy_list",
    "Get KOL (Key Opinion Leader) recent buy list",
    {
      chain: z
        .enum(FEED_CHAINS)
        .optional()
        .default("sol")
        .describe("Chain type: sol (Solana) or bsc (BSC)"),
    },
    async ({ chain }) => {
      return fetchAndFormatBuyList(
        "/api/trade/open/api/kol-buy-list",
        chain,
        "KOL Buyers",
        "No KOL buy records found.",
      );
    },
  );
}
