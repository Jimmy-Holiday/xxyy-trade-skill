import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";
import {
  FEED_CHAINS,
  NATIVE_TOKEN,
  validateWalletAddress,
  explorerUrl,
} from "../validators.js";
import type { Chain } from "../validators.js";

const BSC_LABELS = [
  "Meme",
  "AI",
  "Defi",
  "Games",
  "Infra",
  "De-Sci",
  "Social",
  "Depin",
  "Charity",
  "Others",
] as const;

const VALID_FEE_RATES = [1, 3, 5, 10] as const;

interface LaunchResponse {
  txHash: string | null;
  tokenAddress: string | null;
  success: boolean;
}

export function registerLaunchTools(server: McpServer) {
  server.tool(
    "launch_token",
    "Launch (create) a new token on SOL or BSC chain. Optionally buy an initial amount. " +
      "SOL requires a Metaplex metadata URI; BSC requires desc + image. " +
      "Returns txHash and tokenAddress on success.",
    {
      chain: z
        .enum(FEED_CHAINS)
        .describe("Chain to launch on: sol or bsc"),
      walletAddress: z
        .string()
        .describe("Wallet address (must belong to the API Key's account)"),
      name: z.string().describe("Token name"),
      symbol: z.string().describe("Token symbol"),
      buyAmount: z
        .string()
        .optional()
        .default("0")
        .describe(
          'Native token amount for initial buy. "0" = create only. Max: SOL 100, BSC 20',
        ),
      // --- SOL options ---
      sol_uri: z
        .string()
        .optional()
        .describe(
          "[SOL only, required] Metadata JSON URI (Metaplex standard, containing name/symbol/description/image)",
        ),
      sol_slippage: z
        .number()
        .int()
        .optional()
        .default(100)
        .describe("[SOL only] Slippage in basis points. 100 = 1%. Only effective when buyAmount > 0"),
      sol_priorityFee: z
        .number()
        .optional()
        .default(100000)
        .describe("[SOL only] Priority fee in lamports"),
      sol_tipFee: z
        .number()
        .optional()
        .default(100000)
        .describe("[SOL only] Tip fee in lamports"),
      sol_model: z
        .number()
        .int()
        .optional()
        .default(1)
        .describe("[SOL only] 1 = MEV protection, 2 = fast mode"),
      sol_creator: z
        .string()
        .optional()
        .describe("[SOL only] Creator address (base58). Defaults to signing wallet"),
      sol_mayhemMode: z
        .boolean()
        .optional()
        .default(false)
        .describe("[SOL only] Pump mayhem mode"),
      sol_cashback: z
        .boolean()
        .optional()
        .default(false)
        .describe("[SOL only] Pump cashback"),
      // --- BSC options ---
      bsc_desc: z
        .string()
        .optional()
        .describe("[BSC only, required] Token description"),
      bsc_image: z
        .string()
        .optional()
        .describe("[BSC only, required] Image URL / base64 / data URI (≤5MB)"),
      bsc_label: z
        .enum(BSC_LABELS)
        .optional()
        .default("Meme")
        .describe("[BSC only] Category"),
      bsc_gasPrice: z
        .string()
        .optional()
        .describe("[BSC only] Custom gas price in wei. Auto-fetched if not provided"),
      bsc_model: z
        .number()
        .int()
        .optional()
        .default(1)
        .describe("[BSC only] 1 = MEV protection (bundle), 2 = fast mode"),
      bsc_feePlan: z
        .boolean()
        .optional()
        .default(false)
        .describe("[BSC only] Fee plan toggle"),
      bsc_webUrl: z.string().optional().default("").describe("[BSC only] Website URL"),
      bsc_twitterUrl: z
        .string()
        .optional()
        .default("")
        .describe("[BSC only] Twitter URL"),
      bsc_telegramUrl: z
        .string()
        .optional()
        .default("")
        .describe("[BSC only] Telegram URL"),
      // --- BSC tokenTaxInfo ---
      bsc_tax_feeRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC only] Trading fee rate: 1, 3, 5, or 10 (representing 1%-10%)"),
      bsc_tax_burnRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC only] Burn rate (0-100)"),
      bsc_tax_divideRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC only] Dividend distribution rate (0-100)"),
      bsc_tax_liquidityRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC only] Liquidity pool rate (0-100)"),
      bsc_tax_recipientRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC only] Recipient allocation rate (0-100)"),
      bsc_tax_minSharing: z
        .number()
        .optional()
        .describe(
          "[BSC only] Min token amount for dividend participation (in ether). Required when divideRate > 0. Format: d × 10^n (n≥5, 1≤d≤9)",
        ),
      bsc_tax_recipientAddress: z
        .string()
        .optional()
        .describe("[BSC only] Recipient address (0x...). Required when recipientRate > 0"),
    },
    async (params) => {
      try {
        const { chain, walletAddress, name, symbol, buyAmount } = params;

        validateWalletAddress(walletAddress, chain);

        // Build request body
        const body: Record<string, unknown> = {
          walletAddress,
          name,
          symbol,
          buyAmount,
        };

        if (chain === "sol") {
          if (!params.sol_uri) {
            return errorResult(
              "sol_uri is required for SOL chain launch (Metaplex metadata JSON URI)",
            );
          }
          body.solOptions = {
            uri: params.sol_uri,
            slippage: params.sol_slippage,
            priorityFee: params.sol_priorityFee,
            tipFee: params.sol_tipFee,
            model: params.sol_model,
            ...(params.sol_creator && { creator: params.sol_creator }),
            mayhemMode: params.sol_mayhemMode,
            cashback: params.sol_cashback,
          };
        } else {
          // BSC
          if (!params.bsc_desc) {
            return errorResult("bsc_desc is required for BSC chain launch");
          }
          if (!params.bsc_image) {
            return errorResult("bsc_image is required for BSC chain launch");
          }

          const bscOptions: Record<string, unknown> = {
            desc: params.bsc_desc,
            image: params.bsc_image,
            label: params.bsc_label,
            model: params.bsc_model,
            feePlan: params.bsc_feePlan,
            webUrl: params.bsc_webUrl,
            twitterUrl: params.bsc_twitterUrl,
            telegramUrl: params.bsc_telegramUrl,
          };

          if (params.bsc_gasPrice) {
            bscOptions.gasPrice = params.bsc_gasPrice;
          }

          // Token tax info
          if (params.bsc_tax_feeRate !== undefined) {
            if (!(VALID_FEE_RATES as readonly number[]).includes(params.bsc_tax_feeRate)) {
              return errorResult(
                `Invalid feeRate: ${params.bsc_tax_feeRate}. Must be one of: 1, 3, 5, 10`,
              );
            }

            const burnRate = params.bsc_tax_burnRate ?? 0;
            const divideRate = params.bsc_tax_divideRate ?? 0;
            const liquidityRate = params.bsc_tax_liquidityRate ?? 0;
            const recipientRate = params.bsc_tax_recipientRate ?? 0;

            if (burnRate + divideRate + liquidityRate + recipientRate !== 100) {
              return errorResult(
                `burnRate(${burnRate}) + divideRate(${divideRate}) + liquidityRate(${liquidityRate}) + recipientRate(${recipientRate}) must equal 100`,
              );
            }

            if (divideRate > 0 && params.bsc_tax_minSharing === undefined) {
              return errorResult(
                "bsc_tax_minSharing is required when divideRate > 0",
              );
            }

            if (recipientRate > 0 && !params.bsc_tax_recipientAddress) {
              return errorResult(
                "bsc_tax_recipientAddress is required when recipientRate > 0",
              );
            }

            const tokenTaxInfo: Record<string, unknown> = {
              feeRate: params.bsc_tax_feeRate,
              burnRate,
              divideRate,
              liquidityRate,
              recipientRate,
            };
            if (params.bsc_tax_minSharing !== undefined) {
              tokenTaxInfo.minSharing = params.bsc_tax_minSharing;
            }
            if (params.bsc_tax_recipientAddress) {
              tokenTaxInfo.recipientAddress = params.bsc_tax_recipientAddress;
            }

            bscOptions.tokenTaxInfo = tokenTaxInfo;
          }

          body.bscOptions = bscOptions;
        }

        const client = getClient();
        const res = await client.postNoRetry<LaunchResponse>(
          `/api/trade/open/api/${chain}/launch`,
          body,
        );

        if (res.code !== 200 || !res.data) {
          return errorResult(`API error: ${res.msg} (code: ${res.code})`);
        }

        const data = res.data;
        const chainUpper = chain.toUpperCase();
        const explorer = data.txHash
          ? explorerUrl(chain as Chain, data.txHash)
          : "N/A";

        if (data.success) {
          const lines = [
            `✅ Token launched successfully on ${chainUpper}!`,
            `  Token Name: ${name} (${symbol})`,
            `  Token Address: ${data.tokenAddress}`,
            `  Tx Hash: ${data.txHash}`,
            `  Explorer: ${explorer}`,
          ];
          if (buyAmount !== "0") {
            lines.push(`  Initial Buy: ${buyAmount} ${NATIVE_TOKEN[chain as Chain]}`);
          }
          return textResult(lines.join("\n"));
        } else {
          return textResult(
            [
              `⚠️ Token launch submitted but on-chain execution failed on ${chainUpper}.`,
              `  Tx Hash: ${data.txHash}`,
              `  Explorer: ${explorer}`,
              `  Token Address: ${data.tokenAddress ?? "N/A"}`,
            ].join("\n"),
          );
        }
      } catch (err) {
        return errorResult((err as Error).message);
      }
    },
  );
}
