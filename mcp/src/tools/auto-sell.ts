import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";

interface AutoSellRule {
  id: number;
  taskFlag: number;
  pricePercent: number;
  sellPercent: number;
  isTrailing: number;
  createTime: string;
}

function formatTaskFlag(flag: number): string {
  return flag === 0 ? "Stop-Loss (止损)" : "Take-Profit (止盈)";
}

function formatRule(r: AutoSellRule): string {
  const trailing = r.isTrailing === 1 ? " [Trailing 移动止损]" : "";
  const action = r.taskFlag === 0 ? "drops" : "rises";
  return (
    `  #${r.id} ${formatTaskFlag(r.taskFlag)}${trailing}\n` +
    `    Trigger: price ${action} ${r.pricePercent}% → sell ${r.sellPercent}%`
  );
}

export function registerAutoSellTools(server: McpServer) {
  server.tool(
    "list_auto_sell_rules",
    "List all auto-sell (take-profit / stop-loss) rules for the current user. Shows rule type, trigger percentage, sell percentage, and trailing stop status.",
    {},
    async () => {
      try {
        const client = getClient();
        const res = await client.get<AutoSellRule[]>(
          "/api/trade/open/api/autoSell/list",
        );

        if (!res.success || !res.data) {
          return errorResult(`Failed to list rules: ${res.msg}`);
        }

        if (res.data.length === 0) {
          return textResult(
            "No auto-sell rules configured.\n\n" +
              "Use create_or_update_auto_sell_rules to set up take-profit and stop-loss rules.",
          );
        }

        const tp = res.data.filter((r) => r.taskFlag === 1);
        const sl = res.data.filter((r) => r.taskFlag === 0);

        const lines: string[] = [
          `Auto-Sell Rules — ${res.data.length} rule(s)`,
          "──────────────────────────────",
        ];

        if (tp.length > 0) {
          lines.push("", "Take-Profit (止盈):");
          tp.forEach((r) => lines.push(formatRule(r)));
        }

        if (sl.length > 0) {
          lines.push("", "Stop-Loss (止损):");
          sl.forEach((r) => lines.push(formatRule(r)));
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "create_or_update_auto_sell_rules",
    "Create or update auto-sell rules. WARNING: This is a full replacement — all existing rules are deleted and replaced. Always include ALL desired rules. Use list_auto_sell_rules first to get existing rules, then merge.",
    {
      infos: z
        .array(
          z.object({
            taskFlag: z
              .number()
              .int()
              .min(0)
              .max(1)
              .describe("0 = stop-loss, 1 = take-profit"),
            pricePercent: z
              .number()
              .int()
              .min(1)
              .describe("Trigger percentage (e.g. 30 = 30% price change)"),
            sellPercent: z
              .number()
              .int()
              .min(1)
              .max(100)
              .describe("Percentage of holdings to sell (1-100)"),
            isTrailing: z
              .number()
              .int()
              .min(0)
              .max(1)
              .default(0)
              .optional()
              .describe(
                "Trailing stop: 1=enabled, 0=disabled. Only works for stop-loss (taskFlag=0)",
              ),
          }),
        )
        .min(1)
        .describe("Array of auto-sell rules"),
    },
    async ({ infos }) => {
      try {
        const client = getClient();
        const res = await client.post(
          "/api/trade/open/api/autoSell/createOrUpdate",
          { infos },
        );

        if (!res.success) {
          return errorResult(`Failed to update rules: ${res.msg}`);
        }

        const trailing = infos.filter(
          (i) => i.taskFlag === 0 && i.isTrailing === 1,
        ).length;
        return textResult(
          `Auto-sell rules updated: ${infos.length} rule(s) saved` +
            (trailing > 0 ? ` (${trailing} with trailing stop)` : "") +
            ".",
        );
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "delete_auto_sell_rules",
    "Delete auto-sell rules by ID. Only deletes rules owned by current user.",
    {
      ids: z
        .string()
        .describe("Comma-separated rule IDs to delete (e.g. '123,456')"),
    },
    async ({ ids }) => {
      try {
        const client = getClient();
        const res = await client.get(
          "/api/trade/open/api/autoSell/delete",
          { ids },
        );

        if (!res.success) {
          return errorResult(`Failed to delete rules: ${res.msg}`);
        }

        return textResult(`Deleted rule(s): ${ids}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "toggle_auto_sell",
    "Enable or disable auto-sell. Disabling does NOT delete rules. Optionally close pending orders when disabling.",
    {
      flag: z.boolean().describe("true = enable, false = disable"),
      tokenAddress: z
        .string()
        .optional()
        .describe(
          "When disabling: only close pending orders for this token address",
        ),
      closeAll: z
        .boolean()
        .default(false)
        .optional()
        .describe(
          "When disabling: true = close ALL pending auto-sell orders",
        ),
    },
    async ({ flag, tokenAddress, closeAll }) => {
      try {
        const client = getClient();
        const params: Record<string, string> = { flag: String(flag) };
        if (tokenAddress) params.tokenAddress = tokenAddress;
        if (closeAll) params.closeAll = "true";

        const res = await client.get<boolean>(
          "/api/trade/open/api/autoSell/open",
          params,
        );

        if (!res.success) {
          return errorResult(`Failed to toggle auto-sell: ${res.msg}`);
        }

        const action = flag ? "enabled" : "disabled";
        let extra = "";
        if (!flag && closeAll) extra = " All pending auto-sell orders closed.";
        else if (!flag && tokenAddress)
          extra = ` Pending orders for ${tokenAddress} closed.`;

        return textResult(`Auto-sell ${action}.${extra}`);
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
