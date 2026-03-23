import { getClient } from "../xxyy-client.js";
import { textResult, errorResult } from "../result.js";

export interface TokenInfo {
  pairAddress: string;
  dexId: string;
  dexName: string;
  symbol: string;
  name: string;
  tokenAddress: string;
  imageUrl: string;
  priceUSD: string;
  marketCapUSD: string;
  priceChange24H: string;
  launchFrom: string;
  links: {
    tg: string;
    x: string;
    web: string;
  };
}

export async function fetchAndFormatTokenList(
  url: string,
  method: "GET" | "POST",
  body: Record<string, unknown> | undefined,
  titlePrefix: string,
  emptyMessage: string,
) {
  try {
    const client = getClient();
    const response =
      method === "GET"
        ? await client.get<TokenInfo[]>(url)
        : await client.post<TokenInfo[]>(url, body || {});

    if (response.code !== 200) {
      return errorResult(
        `API error: ${response.msg} (code: ${response.code})`,
      );
    }

    const tokens = response.data || [];
    if (tokens.length === 0) {
      return textResult(emptyMessage);
    }

    const lines: string[] = [];
    lines.push(`${titlePrefix} (${tokens.length} tokens):\n`);

    tokens.forEach((token, idx) => {
      const priceChange = parseFloat(token.priceChange24H);
      const changeIndicator = priceChange >= 0 ? "📈" : "📉";

      lines.push(
        `[${idx + 1}] ${token.symbol} - ${token.name}`,
        `  Token: ${token.tokenAddress}`,
        `  Price: $${parseFloat(token.priceUSD).toFixed(10)}`,
        `  Market Cap: $${parseFloat(token.marketCapUSD).toLocaleString()}`,
        `  24h Change: ${changeIndicator} ${token.priceChange24H}%`,
        `  DEX: ${token.dexName} (${token.launchFrom || "N/A"})`,
      );

      if (token.links.x || token.links.tg || token.links.web) {
        const linkParts = [];
        if (token.links.x) linkParts.push(`X: ${token.links.x}`);
        if (token.links.tg) linkParts.push(`TG: ${token.links.tg}`);
        if (token.links.web) linkParts.push(`Web: ${token.links.web}`);
        lines.push(`  Links: ${linkParts.join(" | ")}`);
      }

      lines.push("");
    });

    return textResult(lines.join("\n").trim());
  } catch (error) {
    return errorResult(`Failed to fetch token list: ${error}`);
  }
}
