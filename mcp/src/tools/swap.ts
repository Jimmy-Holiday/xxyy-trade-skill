import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import {
  VALID_CHAINS,
  validateWalletAddress,
  validateContractAddress,
  validateTip,
  explorerUrl,
  type Chain,
} from "../validators.js";

interface SwapResponse {
  txId?: string;
  signature?: string;
  [key: string]: unknown;
}

function buildSwapHandler(isBuy: boolean) {
  return async (params: {
    chain: string;
    walletAddress: string;
    tokenAddress: string;
    amount: number;
    tip: number;
    slippage?: number;
    model?: number;
    priorityFee?: number;
  }) => {
    try {
      const chain = params.chain as Chain;
      validateWalletAddress(params.walletAddress, chain);
      validateContractAddress(params.tokenAddress, chain);

      const tipWarning = validateTip(params.tip, chain);
      if (tipWarning) {
        return errorResult(
          `${tipWarning}\n\nOrder was NOT submitted. ` +
            `Please adjust tip to the recommended range and try again.`,
        );
      }

      const body: Record<string, unknown> = {
        chain,
        walletAddress: params.walletAddress,
        tokenAddress: params.tokenAddress,
        isBuy,
        amount: params.amount,
        tip: params.tip,
      };

      if (params.slippage !== undefined) body.slippage = params.slippage;
      if (params.model !== undefined) body.model = params.model;
      if (params.priorityFee !== undefined && chain === "sol") {
        body.priorityFee = params.priorityFee;
      }

      const client = getClient();
      const res = await client.postNoRetry<SwapResponse>(
        "/api/trade/open/api/swap",
        body,
      );

      const action = isBuy ? "Buy" : "Sell";
      const txId = res.data?.txId || res.data?.signature;
      const lines: string[] = [];

      if (res.success && txId) {
        lines.push(`${action} order submitted successfully.`);
        lines.push(`Transaction ID: ${txId}`);
        lines.push(`Explorer: ${explorerUrl(chain, txId as string)}`);
        lines.push(
          "",
          "Use query_trade tool with this txId to check transaction status.",
        );
      } else {
        lines.push(`${action} order response: ${res.msg}`);
        if (res.data) lines.push(`Data: ${JSON.stringify(res.data)}`);
      }

      return textResult(lines.join("\n"));
    } catch (err) {
      return errorResult((err as Error).message);
    }
  };
}

const swapSchema = {
  chain: z.enum(VALID_CHAINS).describe("Blockchain network"),
  walletAddress: z.string().describe("Wallet address on XXYY platform"),
  tokenAddress: z.string().describe("Token contract address"),
  amount: z.number().describe("Amount"),
  tip: z
    .number()
    .describe("Priority fee. SOL: 0.001-0.1 (SOL); EVM: 0.1-100 (Gwei)"),
  slippage: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe("Slippage tolerance %, default 20"),
  model: z
    .union([z.literal(1), z.literal(2)])
    .optional()
    .describe("1=anti-sandwich (default), 2=fast mode"),
  priorityFee: z
    .number()
    .min(0)
    .optional()
    .describe("Solana only. Extra priority fee in addition to tip"),
};

export function registerSwapTools(server: McpServer) {
  server.tool(
    "buy_token",
    "Buy a token on-chain via XXYY. Amount is in native currency (SOL/ETH/BNB).",
    {
      ...swapSchema,
      amount: z
        .number()
        .gt(0)
        .describe("Amount in native currency (SOL/ETH/BNB)"),
    },
    buildSwapHandler(true),
  );

  server.tool(
    "sell_token",
    "Sell a token on-chain via XXYY. Amount is a sell percentage (1-100).",
    {
      ...swapSchema,
      amount: z
        .number()
        .min(1)
        .max(100)
        .describe("Sell percentage (1-100). Example: 50 = sell 50% of holdings"),
    },
    buildSwapHandler(false),
  );
}
