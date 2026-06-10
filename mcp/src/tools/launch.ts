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

const OPENFOUR_TEMPLATE_ALIASES = [
  "skillroyalty",
  "creator_incentives",
  "likwid_dex",
  "cubepeg",
] as const;

const OPENFOUR_TEMPLATE_IDS: Record<(typeof OPENFOUR_TEMPLATE_ALIASES)[number], string> = {
  skillroyalty: "1778027615723",
  creator_incentives: "1778027615724",
  likwid_dex: "1778027615725",
  cubepeg: "1778027615728",
};

const OPENFOUR_TEMPLATE_NAMES: Record<string, string> = {
  "1778027615723": "Goplus SkillRoyalty",
  "1778027615724": "Goplus Creator Incentives",
  "1778027615725": "Likwid Dex",
  "1778027615728": "Cubepeg",
};

const OPENFOUR_TEMPLATE_ID_SET = new Set(Object.values(OPENFOUR_TEMPLATE_IDS));
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const BYTES32_RE = /^0x[a-fA-F0-9]{64}$/;

interface LaunchResponse {
  txHash: string | null;
  tokenAddress: string | null;
  success: boolean;
}

function parseJsonObject(value: string | undefined, fieldName: string): Record<string, unknown> {
  if (!value || !value.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("must be a JSON object");
    }
    return parsed as Record<string, unknown>;
  } catch (err) {
    throw new Error(`${fieldName} must be a valid JSON object string: ${(err as Error).message}`);
  }
}

function validateEvmAddress(value: string | undefined, fieldName: string): string | null {
  if (!value) {
    return null;
  }
  return EVM_ADDRESS_RE.test(value) ? null : `${fieldName} must be an EVM address (0x + 40 hex chars)`;
}

function validateBytes32(value: string | undefined, fieldName: string): string | null {
  if (!value) {
    return null;
  }
  return BYTES32_RE.test(value) ? null : `${fieldName} must be bytes32 (0x + 64 hex chars)`;
}

function validateBps(value: number | undefined, fieldName: string): string | null {
  if (value === undefined) {
    return null;
  }
  if (!Number.isInteger(value) || value < 0 || value > 1000) {
    return `${fieldName} must be basis points from 0 to 1000 (100 = 1%)`;
  }
  return null;
}

export function registerLaunchTools(server: McpServer) {
  server.tool(
    "launch_token",
    "Launch (create) a new token on SOL or BSC chain. Optionally buy an initial amount. " +
      "SOL requires a Metaplex metadata URI; BSC requires desc + image and supports legacy FourMeme or OpenFour templates. " +
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
      bsc_launchMode: z
        .enum(["legacy", "openfour"])
        .optional()
        .describe("[BSC only] Launch mode. Omit for legacy unless an OpenFour template is provided"),
      bsc_openfourTemplate: z
        .enum(OPENFOUR_TEMPLATE_ALIASES)
        .optional()
        .describe("[BSC OpenFour] Template alias: skillroyalty, creator_incentives, likwid_dex, cubepeg"),
      bsc_openfourTemplateId: z
        .string()
        .optional()
        .describe("[BSC OpenFour] Template ID: 1778027615723, 1778027615724, 1778027615725, or 1778027615728"),
      bsc_openfour_antiSniperEnabled: z
        .boolean()
        .optional()
        .describe("[BSC OpenFour] Optional anti-sniper toggle"),
      bsc_openfour_renderer: z
        .string()
        .optional()
        .describe("[BSC OpenFour Cubepeg] Optional renderer EVM address"),
      bsc_openfour_hookSalt: z
        .string()
        .optional()
        .describe("[BSC OpenFour Cubepeg advanced] Optional bytes32 hookSalt. Node service auto-mines when omitted"),
      bsc_openfour_buyFeeRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Buy fee in bps. 100 = 1%"),
      bsc_openfour_sellFeeRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Sell fee in bps. 100 = 1%"),
      bsc_openfour_rateFounder: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Founder fee share (0-100)"),
      bsc_openfour_rateHolder: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Holder fee share (0-100)"),
      bsc_openfour_rateBurn: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Burn fee share (0-100)"),
      bsc_openfour_rateLiquidity: z
        .number()
        .int()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Liquidity fee share (0-100)"),
      bsc_openfour_minShare: z
        .string()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Minimum share threshold, passed as string/uint value"),
      bsc_openfour_founder: z
        .string()
        .optional()
        .describe("[BSC OpenFour SkillRoyalty] Founder EVM address. Defaults to signing wallet in the Node service"),
      bsc_openfourParamsJson: z
        .string()
        .optional()
        .describe("[BSC OpenFour advanced] Raw openFourParams JSON object string. Merged before typed OpenFour fields"),
      bsc_openfourInitParamsJson: z
        .string()
        .optional()
        .describe("[BSC OpenFour advanced] Raw initParams JSON object string containing encoded module bytes"),
      // --- BSC tokenTaxInfo ---
      bsc_tax_feeRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC legacy only] Trading fee rate: 1, 3, 5, or 10 (representing 1%-10%)"),
      bsc_tax_burnRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC legacy only] Burn rate (0-100)"),
      bsc_tax_divideRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC legacy only] Dividend distribution rate (0-100)"),
      bsc_tax_liquidityRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC legacy only] Liquidity pool rate (0-100)"),
      bsc_tax_recipientRate: z
        .number()
        .int()
        .optional()
        .describe("[BSC legacy only] Recipient allocation rate (0-100)"),
      bsc_tax_minSharing: z
        .number()
        .optional()
        .describe(
          "[BSC legacy only] Min token amount for dividend participation (in ether). Required when divideRate > 0. Format: d × 10^n (n≥5, 1≤d≤9)",
        ),
      bsc_tax_recipientAddress: z
        .string()
        .optional()
        .describe("[BSC legacy only] Recipient address (0x...). Required when recipientRate > 0"),
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

        let openFourTemplateName: string | null = null;
        let openFourTemplateId: string | null = null;

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

          const alias = params.bsc_openfourTemplate;
          const templateIdFromAlias = alias ? OPENFOUR_TEMPLATE_IDS[alias] : undefined;
          const templateIdFromParam = params.bsc_openfourTemplateId?.trim();
          const wantsOpenFour =
            params.bsc_launchMode === "openfour" ||
            (!params.bsc_launchMode && Boolean(templateIdFromAlias || templateIdFromParam));
          const hasOpenFourFields = Boolean(
            templateIdFromAlias ||
              templateIdFromParam ||
              params.bsc_openfour_antiSniperEnabled !== undefined ||
              params.bsc_openfour_renderer ||
              params.bsc_openfour_hookSalt ||
              params.bsc_openfour_buyFeeRate !== undefined ||
              params.bsc_openfour_sellFeeRate !== undefined ||
              params.bsc_openfour_rateFounder !== undefined ||
              params.bsc_openfour_rateHolder !== undefined ||
              params.bsc_openfour_rateBurn !== undefined ||
              params.bsc_openfour_rateLiquidity !== undefined ||
              params.bsc_openfour_minShare !== undefined ||
              params.bsc_openfour_founder ||
              params.bsc_openfourParamsJson ||
              params.bsc_openfourInitParamsJson,
          );
          if (!wantsOpenFour && hasOpenFourFields) {
            return errorResult(
              "OpenFour fields require bsc_launchMode=openfour or an omitted launch mode with a supported OpenFour template",
            );
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

          if (wantsOpenFour) {
            openFourTemplateId = templateIdFromParam || templateIdFromAlias || null;
            if (!openFourTemplateId) {
              return errorResult(
                "bsc_openfourTemplate or bsc_openfourTemplateId is required when bsc_launchMode is openfour",
              );
            }
            if (templateIdFromAlias && templateIdFromParam && templateIdFromAlias !== templateIdFromParam) {
              return errorResult(
                `bsc_openfourTemplate (${templateIdFromAlias}) and bsc_openfourTemplateId (${templateIdFromParam}) do not match`,
              );
            }
            if (!OPENFOUR_TEMPLATE_ID_SET.has(openFourTemplateId)) {
              return errorResult(
                `Unsupported OpenFour templateId: ${openFourTemplateId}. Supported: ${Object.values(OPENFOUR_TEMPLATE_IDS).join(", ")}`,
              );
            }
            if (params.bsc_tax_feeRate !== undefined) {
              return errorResult(
                "bsc_tax_* fields are for legacy BSC launches. Use bsc_openfour_* fields for OpenFour SkillRoyalty tax settings",
              );
            }

            const hasSkillRoyaltyFields =
              params.bsc_openfour_buyFeeRate !== undefined ||
              params.bsc_openfour_sellFeeRate !== undefined ||
              params.bsc_openfour_rateFounder !== undefined ||
              params.bsc_openfour_rateHolder !== undefined ||
              params.bsc_openfour_rateBurn !== undefined ||
              params.bsc_openfour_rateLiquidity !== undefined ||
              params.bsc_openfour_minShare !== undefined ||
              Boolean(params.bsc_openfour_founder);
            if (openFourTemplateId !== OPENFOUR_TEMPLATE_IDS.skillroyalty && hasSkillRoyaltyFields) {
              return errorResult(
                "bsc_openfour_* SkillRoyalty fee fields require templateId 1778027615723",
              );
            }
            if (
              openFourTemplateId !== OPENFOUR_TEMPLATE_IDS.cubepeg &&
              (params.bsc_openfour_renderer || params.bsc_openfour_hookSalt)
            ) {
              return errorResult("bsc_openfour_renderer and hookSalt require Cubepeg templateId 1778027615728");
            }

            for (const validationError of [
              validateEvmAddress(params.bsc_openfour_renderer, "bsc_openfour_renderer"),
              validateEvmAddress(params.bsc_openfour_founder, "bsc_openfour_founder"),
              validateBytes32(params.bsc_openfour_hookSalt, "bsc_openfour_hookSalt"),
              validateBps(params.bsc_openfour_buyFeeRate, "bsc_openfour_buyFeeRate"),
              validateBps(params.bsc_openfour_sellFeeRate, "bsc_openfour_sellFeeRate"),
            ]) {
              if (validationError) {
                return errorResult(validationError);
              }
            }

            const openFourParams = parseJsonObject(
              params.bsc_openfourParamsJson,
              "bsc_openfourParamsJson",
            );
            const initParams = parseJsonObject(
              params.bsc_openfourInitParamsJson,
              "bsc_openfourInitParamsJson",
            );

            if (params.bsc_openfour_renderer) {
              openFourParams.renderer = params.bsc_openfour_renderer;
            }
            if (params.bsc_openfour_hookSalt) {
              openFourParams.hookSalt = params.bsc_openfour_hookSalt;
            }
            if (params.bsc_openfour_buyFeeRate !== undefined) {
              openFourParams.buyFeeRate = params.bsc_openfour_buyFeeRate;
            }
            if (params.bsc_openfour_sellFeeRate !== undefined) {
              openFourParams.sellFeeRate = params.bsc_openfour_sellFeeRate;
            }
            if (params.bsc_openfour_founder) {
              openFourParams.founder = params.bsc_openfour_founder;
            }
            if (params.bsc_openfour_minShare !== undefined) {
              openFourParams.minShare = params.bsc_openfour_minShare;
            }

            const rateFields = [
              params.bsc_openfour_rateFounder,
              params.bsc_openfour_rateHolder,
              params.bsc_openfour_rateBurn,
              params.bsc_openfour_rateLiquidity,
            ];
            const hasRateOverride = rateFields.some((value) => value !== undefined);
            if (hasRateOverride) {
              const [rateFounder = 0, rateHolder = 0, rateBurn = 0, rateLiquidity = 0] = rateFields;
              if ([rateFounder, rateHolder, rateBurn, rateLiquidity].some((value) => value < 0 || value > 100)) {
                return errorResult("OpenFour SkillRoyalty rate shares must be between 0 and 100");
              }
              if (rateFounder + rateHolder + rateBurn + rateLiquidity !== 100) {
                return errorResult(
                  `bsc_openfour_rateFounder(${rateFounder}) + rateHolder(${rateHolder}) + rateBurn(${rateBurn}) + rateLiquidity(${rateLiquidity}) must equal 100`,
                );
              }
              openFourParams.rateFounder = rateFounder;
              openFourParams.rateHolder = rateHolder;
              openFourParams.rateBurn = rateBurn;
              openFourParams.rateLiquidity = rateLiquidity;
            }

            bscOptions.launchMode = "openfour";
            bscOptions.templateId = openFourTemplateId;
            if (Object.keys(openFourParams).length > 0) {
              bscOptions.openFourParams = openFourParams;
            }
            if (Object.keys(initParams).length > 0) {
              bscOptions.initParams = initParams;
            }
            if (params.bsc_openfour_antiSniperEnabled !== undefined) {
              bscOptions.antiSniperEnabled = params.bsc_openfour_antiSniperEnabled;
            }
            openFourTemplateName = OPENFOUR_TEMPLATE_NAMES[openFourTemplateId];
          } else {
            // Token tax info (legacy BSC only)
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
          if (openFourTemplateName && openFourTemplateId) {
            lines.splice(2, 0, `  Launch Mode: OpenFour (${openFourTemplateName}, ${openFourTemplateId})`);
          }
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
