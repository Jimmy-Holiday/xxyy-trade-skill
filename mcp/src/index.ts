#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSwapTools } from "./tools/swap.js";
import { registerTradeTools } from "./tools/trade.js";
import { registerFeedTools } from "./tools/feed.js";
import { registerQueryTools } from "./tools/query.js";
import { registerWalletTools } from "./tools/wallets.js";

const server = new McpServer({
  name: "xxyy-trade",
  version: "1.2.1",
});

registerSwapTools(server);
registerTradeTools(server);
registerFeedTools(server);
registerQueryTools(server);
registerWalletTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
