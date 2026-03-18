import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import { VALID_CHAINS, NATIVE_TOKEN, validateWalletAddress, type Chain } from "../validators.js";

interface TokenBalance {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString?: string;
}

interface WalletBase {
  name: string;
  address: string;
  balance: number;
  topUp: number;
  isImport: boolean;
  tokenBalance?: TokenBalance | null;
  [key: string]: unknown;
}

interface WalletItem extends WalletBase {
  userId: number;
  chain: number;
  createTime: string;
  updateTime: string;
}

interface WalletsData {
  totalCount: number;
  pageSize: number;
  totalPage: number;
  currPage: number;
  list: WalletItem[];
}

type WalletInfoData = WalletBase & { chain: number };

function formatWalletName(w: WalletBase): string {
  const pinned = w.topUp === 1 ? "⭐ " : "";
  const imported = w.isImport ? " (imported)" : "";
  const name = w.name || `${w.address.slice(0, 5)}***${w.address.slice(-5)}`;
  return `${pinned}${name}${imported}`;
}

function formatTokenHoldings(tb: TokenBalance): string {
  const display = tb.uiAmountString ?? String(tb.uiAmount);
  return `  Token Holdings: ${display} (raw: ${tb.amount}, decimals: ${tb.decimals})`;
}

export function registerWalletTools(server: McpServer) {
  server.tool(
    "list_wallets",
    "List wallets on XXYY platform for the current user. Returns wallet addresses and native token balances. Use this when the user wants to see their wallets or when a wallet address is needed for trading.",
    {
      chain: z
        .enum(VALID_CHAINS)
        .default("sol")
        .describe("Blockchain network, default sol"),
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
      tokenAddress: z
        .string()
        .optional()
        .describe("Token contract address to check holdings"),
    },
    async ({ chain, pageNum, pageSize, tokenAddress }) => {
      try {
        const client = getClient();

        const params: Record<string, string> = { chain };
        if (pageNum !== undefined) params.pageNum = String(pageNum);
        if (pageSize !== undefined) params.pageSize = String(pageSize);
        if (tokenAddress) params.tokenAddress = tokenAddress;

        const res = await client.get<WalletsData>(
          "/api/trade/open/api/wallets",
          params,
        );

        if (!res.success || !res.data) {
          return errorResult(`Wallet query failed: ${res.msg}`);
        }

        const d = res.data;
        const native = NATIVE_TOKEN[chain];

        if (!d.list || d.list.length === 0) {
          return textResult(
            `No wallets found on ${chain.toUpperCase()}.\n\n` +
              `Create a wallet at: https://www.xxyy.io/wallet/manager?chainId=${chain}`,
          );
        }

        const lines: string[] = [
          `Wallets on ${chain.toUpperCase()} — ${d.totalCount} wallet(s)`,
          "──────────────────────────────",
          "",
        ];

        for (const w of d.list) {
          lines.push(formatWalletName(w));
          lines.push(`  Address: ${w.address}`);
          lines.push(`  Balance: ${w.balance} ${native}`);
          if (w.tokenBalance) lines.push(formatTokenHoldings(w.tokenBalance));
          lines.push("");
        }

        if (d.totalPage > 1) {
          lines.push(`Page ${d.currPage}/${d.totalPage}`);
        }

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );

  server.tool(
    "wallet_info",
    "Query a single wallet's details including native token balance and optional token holdings. Use this when the user wants to check a specific wallet's balance.",
    {
      walletAddress: z
        .string()
        .describe("Wallet address to query"),
      chain: z
        .enum(VALID_CHAINS)
        .default("sol")
        .describe("Blockchain network, default sol"),
      tokenAddress: z
        .string()
        .optional()
        .describe("Token contract address to check holdings"),
    },
    async ({ walletAddress, chain, tokenAddress }) => {
      try {
        validateWalletAddress(walletAddress, chain as Chain);

        const client = getClient();
        const params: Record<string, string> = { walletAddress, chain };
        if (tokenAddress) params.tokenAddress = tokenAddress;

        const res = await client.get<WalletInfoData>(
          "/api/trade/open/api/wallet/info",
          params,
        );

        if (!res.success || !res.data) {
          return errorResult(`Wallet info query failed: ${res.msg}`);
        }

        const d = res.data;
        const native = NATIVE_TOKEN[chain];

        const lines: string[] = [
          formatWalletName(d),
          `  Chain: ${chain.toUpperCase()}`,
          `  Address: ${d.address}`,
          `  Balance: ${d.balance} ${native}`,
        ];

        if (d.tokenBalance) lines.push(formatTokenHoldings(d.tokenBalance));

        return textResult(lines.join("\n"));
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
