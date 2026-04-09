#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSwapTools } from "./tools/swap.js";
import { registerTradeTools } from "./tools/trade.js";
import { registerFeedTools } from "./tools/feed.js";
import { registerQueryTools } from "./tools/query.js";
import { registerWalletTools } from "./tools/wallets.js";
import { registerPnlTools } from "./tools/pnl.js";
import { registerIpTools } from "./tools/ip.js";
import { registerKolTools } from "./tools/kol.js";
import { registerTagHolderTools } from "./tools/tag-holder.js";
import { registerLabelTools } from "./tools/label.js";
import { registerSignalTools } from "./tools/signal.js";
import { registerTrendingTools } from "./tools/trending.js";
import { registerLaunchTools } from "./tools/launch.js";
import { registerAutoSellTools } from "./tools/auto-sell.js";

const server = new McpServer({
  name: "xxyy-trade",
  version: "1.4.0",
});

registerSwapTools(server);
registerTradeTools(server);
registerFeedTools(server);
registerQueryTools(server);
registerWalletTools(server);
registerPnlTools(server);
registerIpTools(server);
registerKolTools(server);
registerTagHolderTools(server);
registerLabelTools(server);
registerSignalTools(server);
registerTrendingTools(server);
registerLaunchTools(server);
registerAutoSellTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
