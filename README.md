# XXYY Trade Skill

**English** | [中文](docs/README_ZH.md)

Trade tokens on **Solana**, **Ethereum**, **BSC**, and **Base** chains via [XXYY](https://www.xxyy.io) Open API -- using natural language.

Supports **Claude Code Skill**, **OpenClaw**, and **MCP Server** (for Claude Desktop, Cursor, Windsurf, Cline, and more).

> [!CAUTION]
> **Your API Key = Your Wallet.** The XXYY API Key can execute real on-chain trades using your wallet balance. If it leaks, anyone can buy/sell tokens with your funds. **Never share it, never commit it to git, never paste it in public channels.** If you suspect a leak, regenerate the key immediately at [xxyy.io](https://www.xxyy.io).

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

The skill will auto-select a wallet and confirm trade details with you before executing.

> Setup guide & tips: [Configuration Guide](https://x.com/PepeBoost888/status/2032052111010382031)

## Supported Chains

| Chain | Native Token |
|-------|-------------|
| Solana (`sol`) | SOL |
| Ethereum (`eth`) | ETH |
| BSC (`bsc`) | BNB |
| Base (`base`) | ETH |

## License

[MIT](LICENSE)
