import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchAndFormatTokenList } from "./token-list-common.js";

const SUPPORTED_CHAINS = ["sol"] as const;
const SUPPORTED_LABEL_TYPES = ["AGENT_KOL"] as const;

export function registerLabelTools(server: McpServer) {
  server.tool(
    "label_list",
    "Get label list (e.g., AGENT_KOL marked tokens)",
    {
      chain: z
        .enum(SUPPORTED_CHAINS)
        .optional()
        .default("sol")
        .describe("Chain type, currently only supports sol"),
      labelType: z
        .enum(SUPPORTED_LABEL_TYPES)
        .optional()
        .default("AGENT_KOL")
        .describe("Label type, currently only supports AGENT_KOL"),
    },
    async ({ chain, labelType }) => {
      const url = `/api/trade/open/api/label-list?chain=${chain}&labelType=${labelType}`;
      return fetchAndFormatTokenList(
        url,
        "GET",
        undefined,
        `${labelType} Label Tokens`,
        `No ${labelType} label tokens found on ${chain.toUpperCase()}.`,
      );
    },
  );
}
