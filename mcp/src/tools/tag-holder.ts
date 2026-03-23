import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FEED_CHAINS } from "../validators.js";
import { fetchAndFormatBuyList } from "./buy-list-common.js";

export function registerTagHolderTools(server: McpServer) {
  server.tool(
    "tag_holder_buy_list",
    "Get tag holder (Smart Money, Whale, etc.) recent buy list",
    {
      chain: z
        .enum(FEED_CHAINS)
        .optional()
        .default("sol")
        .describe("Chain type: sol (Solana) or bsc (BSC)"),
    },
    async ({ chain }) => {
      return fetchAndFormatBuyList(
        "/api/trade/open/api/tag-holder-buy-list",
        chain,
        "Tag Holders",
        "No tag holder buy records found.",
      );
    },
  );
}
