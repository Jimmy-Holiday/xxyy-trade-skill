# XXYY Trade Skill

**English** | [中文](docs/README_ZH.md)

Trade tokens on **Solana**, **Ethereum**, **BSC**, and **Base** chains via [XXYY](https://www.xxyy.io) Open API -- using natural language.

[XXYY](https://www.xxyy.io) is a memecoin trading platform launched ~18 months ago, known for **fast execution**, **rich feature set**, and **high rebate / cashback ratios**. Using the XXYY API, you get both **fee discounts** and **referral rebates** — effective fees as low as **~0.4%**.

![chains](https://img.shields.io/badge/chains-SOL%20|%20ETH%20|%20BSC%20|%20Base-blue)
![fee](https://img.shields.io/badge/fee-as%20low%20as%200.4%25-brightgreen)
![rebate](https://img.shields.io/badge/rebate-enabled-orange)
![version](https://img.shields.io/badge/version-1.5.1-informational)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

Supports **Claude Code Skill**, **OpenClaw**, and **MCP Server** (for Claude Desktop, Cursor, Windsurf, Cline, and more).

> [!CAUTION]
> **Your API Key = Your Wallet.** The XXYY API Key can execute real on-chain trades using your wallet balance. If it leaks, anyone can buy/sell tokens with your funds. **Never share it, never commit it to git, never paste it in public channels.** If you suspect a leak, regenerate the key immediately at [xxyy.io](https://www.xxyy.io).

## Features

| Page | Description |
|------|-------------|
| **Overview & Auth** | Supported chains, IP whitelist policy, error codes |
| **Trading** | One-click buy/sell, multi-wallet switching, slippage & tip control, trade result polling |
| **Feed Discovery** | Real-time streams for newly-listed, almost-graduated, and already-graduated tokens |
| **Token Query** | Price, market cap, security risks, tax, LP lock, social links, top 10 holders, and more |
| **Trending & Signals** | Trending leaderboards, AI signal picks, KOL / followed-wallet buy tracking |
| **Wallet APIs** | Wallet list, balances, PnL stats, trade history |
| **Auto Sell** | Custom take-profit / stop-loss ratios, automatic order placement, trailing-stop support |
| **Token Launch** | Create new tokens on Solana and BSC |
| **Ops & Health** | Health check, outbound IP lookup |

## Install

### MCP Server (Claude Desktop / Cursor / Windsurf / Cline / ...)

Works with any MCP-compatible AI client. See **[mcp/README.md](mcp/README.md)** for full setup guide.

```bash
# 1. Clone & build
git clone https://github.com/Jimmy-Holiday/xxyy-trade-skill.git
cd xxyy-trade-skill/mcp
npm install && npm run build

# 2. Add to Claude Code (example)
claude mcp add xxyy-trade \
  -e XXYY_API_KEY=xxyy_ak_your_key_here \
  -- node /path/to/xxyy-trade-skill/mcp/dist/index.js
```

For other clients (Claude Desktop, Cursor, Windsurf, Cline, Continue.dev, Zed, Cherry Studio), add to the corresponding JSON/YAML config:

```json
{
  "mcpServers": {
    "xxyy-trade": {
      "command": "node",
      "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
      "env": { "XXYY_API_KEY": "xxyy_ak_your_key_here" }
    }
  }
}
```

> Full client-by-client examples: [mcp/README.md](mcp/README.md)

### Claude Code Skill

**Step 1** — Add the marketplace source:

```bash
/plugin marketplace add Jimmy-Holiday/xxyy-trade-skill
```

**Step 2** — Install the plugin:

Open `/plugin` → switch to **Marketplaces** tab → select **xxyy-trade-skill** → **Browse plugins** → install **xxyy-trade**.

> **Troubleshooting:** If the marketplace doesn't appear in the Marketplaces tab after Step 1 succeeds, exit the `/plugin` UI and re-open it.

Or manually: copy `skills/xxyy-trade/` into your project's `.claude/skills/` directory.

### OpenClaw

Paste the skill URL in your OpenClaw conversation:

```
https://clawhub.ai/Jimmy-Holiday/xxyy-trade-skill
```

Or via ClawHub CLI:

```bash
clawhub install xxyy-trade-skill
```

## Setup

Export your XXYY API Key before use:

```bash
export XXYY_API_KEY=xxyy_ak_your_key_here
```

Get an API Key at [xxyy.io/apikey](https://www.xxyy.io/apikey) — register, log in, and generate a new key.

Optionally set a custom base URL:

```bash
export XXYY_API_BASE_URL=https://www.xxyy.io
```

## Usage

Once installed, simply tell Claude what you want to do:

- `"show my wallets on SOL"`
- `"check balance of <wallet_address>"`
- `"buy 0.1 SOL of <token_address>"`
- `"sell 50% of <token_address> on BSC"`
- `"check trade status <txId>"`
- `"ping xxyy api"`
- `"scan new tokens on solana"`
- `"show almost-graduated tokens on BSC with market cap > 50000"`
- `"query token details for 0x1234..."`
- `"monitor SOL for new tokens, min holders 50"`
- `"show KOL buy list on SOL"`
- `"get tag holder buy list on BSC"`
- `"show label list for AGENT_KOL"` (SOL only)
- `"get AI trending signals"` (SOL/BSC)
- `"show trending tokens on SOL"` (SOL/BSC)
- `"launch a new token on SOL"` (SOL/BSC)

The skill will auto-select a wallet and confirm trade details with you before executing.

> Setup guide & tips: [Configuration Guide](https://x.com/PepeBoost888/status/2032052111010382031)

## Supported Chains

| Chain | Native Token |
|-------|-------------|
| Solana (`sol`) | SOL |
| Ethereum (`eth`) | ETH |
| BSC (`bsc`) | BNB |
| Base (`base`) | ETH |

## Links

- **Official Twitter**: [@useXXYYio](https://x.com/useXXYYio)
- **Co-founder Twitter**: [@PepeBoost888](https://x.com/PepeBoost888)
- **Lobster Community (Telegram)**: [XXYYCLAW](https://t.me/XXYYCLAW)
- **Website**: [xxyy.io](https://www.xxyy.io)

## License

[MIT](LICENSE)
