import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";

interface IpData {
  ip: string;
}

export function registerIpTools(server: McpServer) {
  server.tool(
    "get_ip",
    "Get your current outbound IP address. Use this to check which IP to add to your API Key's whitelist. This endpoint is exempt from IP whitelist restrictions.",
    {},
    async () => {
      try {
        const client = getClient();
        const res = await client.get<IpData>("/api/trade/open/api/ip");

        if (res.success && res.data?.ip) {
          return textResult(`Your outbound IP: ${res.data.ip}`);
        }
        return errorResult(`Failed to get IP: ${res.msg}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
