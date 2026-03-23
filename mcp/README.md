# XXYY Trade MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Jimmy-Holiday/xxyy-trade-skill/blob/main/LICENSE)

MCP Server for on-chain token trading and data queries via [XXYY](https://xxyy.io) Open API.

Supports **Solana**, **Ethereum**, **BSC**, and **Base** chains.

**English** | [中文](docs/README_ZH.md)

> [!CAUTION]
> **Your API Key = Your Wallet.** The XXYY API Key can execute real on-chain trades using your wallet balance. If it leaks, anyone can buy/sell tokens with your funds. **Never share it, never commit it to git, never paste it in public channels.** If you suspect a leak, regenerate the key immediately at [xxyy.io](https://xxyy.io).

## Tools

| Tool | Description |
|------|-------------|
| `buy_token` | Buy a token with native currency (SOL/ETH/BNB) |
| `sell_token` | Sell a token by percentage (1-100%) |
| `query_trade` | Query transaction status by txId |
| `list_trades` | Query successful trade history for a wallet |
| `ping` | Verify API Key validity |
| `feed_scan` | Scan Meme token lists (SOL/BSC only) |
| `token_query` | Query token details, security checks, tax rates |
| `pnl_query` | Query PNL (profit/loss) for a wallet-token pair |
| `list_wallets` | List user wallets with balances on a specific chain |
| `wallet_info` | Query a single wallet's balance and token holdings |
| `get_ip` | Get your outbound IP for whitelist configuration |
| `kol_buy_list` | Get KOL (Key Opinion Leader) recent buy list |
| `tag_holder_buy_list` | Get tag holder (Smart Money, Whale, etc.) recent buy list |

## Prerequisites

- **Node.js >= 18** — download at [https://nodejs.org](https://nodejs.org) (LTS recommended). Verify: `node -v`
- **XXYY API Key** — get one at [xxyy.io/apikey](https://www.xxyy.io/apikey)

## Quick Install

```bash
git clone https://github.com/Jimmy-Holiday/xxyy-trade-skill.git
cd xxyy-trade-skill/mcp
npm install && npm run build
```

### Claude Code

```bash
claude mcp add xxyy-trade \
  -e XXYY_API_KEY=<your-key> \
  -- node /path/to/xxyy-trade-skill/mcp/dist/index.js
```

> Replace `/path/to/xxyy-trade-skill` with your actual local path, and `<your-key>` with your API Key.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "xxyy-trade": {
      "command": "node",
      "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
      "env": {
        "XXYY_API_KEY": "<your-key>"
      }
    }
  }
}
```

### Cursor

Edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "xxyy-trade": {
      "command": "node",
      "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
      "env": {
        "XXYY_API_KEY": "<your-key>"
      }
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "xxyy-trade": {
      "command": "node",
      "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
      "env": {
        "XXYY_API_KEY": "<your-key>"
      }
    }
  }
}
```

### Cline

VS Code sidebar > Cline > MCP Servers > Configure, edit `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "xxyy-trade": {
      "command": "node",
      "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
      "env": {
        "XXYY_API_KEY": "<your-key>"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Continue.dev

Edit `~/.continue/config.yaml`:

```yaml
mcpServers:
  - name: xxyy-trade
    command: node
    args:
      - /path/to/xxyy-trade-skill/mcp/dist/index.js
    env:
      XXYY_API_KEY: <your-key>
```

### Zed Editor

Edit `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "xxyy-trade": {
      "command": {
        "path": "node",
        "args": ["/path/to/xxyy-trade-skill/mcp/dist/index.js"],
        "env": {
          "XXYY_API_KEY": "<your-key>"
        }
      }
    }
  }
}
```

### Any stdio MCP Client

```bash
XXYY_API_KEY=<your-key> node /path/to/xxyy-trade-skill/mcp/dist/index.js
```

---

## What Can It Do?

After connecting, just tell your AI assistant:

| You Say | It Does |
|---------|---------|
| "Show my wallets on SOL" | List wallets with balances |
| "Check balance of `<wallet_address>`" | Query single wallet details |
| "Buy 0.1 SOL of `<token_address>`" | Auto-select wallet, confirm, then buy |
| "Sell 50% of `<token_address>` on BSC" | Auto-select wallet, confirm, then sell |
| "Check trade status `<txId>`" | Query transaction result |
| "Scan new tokens on Solana" | Feed scan for new launches |
| "Show graduated tokens on BSC with market cap > 50000" | Filtered feed scan |
| "Query token details for `<contract_address>`" | Security check + token info |
| "Show my PNL for `<token_address>` on BSC" | Profit/loss summary for a token |
| "Show my trade history on SOL" | Paginated list of successful trades |
| "Show KOL buy list on SOL" | Query KOL wallet buy activity |
| "Get tag holder buy list on BSC" | Query specific tag holder buys |
| "Show label list for AGENT_KOL" | Query tokens with labels (SOL only) |
| "Get AI trending signals" | Query AI trend signal tokens (SOL only) |
| "Ping XXYY API" | Verify API Key connectivity |
| "What's my IP?" | Check outbound IP for whitelist setup |

## Compatibility

| Client | Installation | Status |
|--------|-------------|--------|
| **Claude Code** | `claude mcp add` | One-line |
| Claude Desktop | JSON config | Supported |
| Cursor | JSON config | Supported |
| Windsurf | JSON config | Supported |
| Cline | JSON config | Supported |
| Continue.dev | YAML config | Supported |
| Zed | JSON config | Supported |
| Cherry Studio | GUI config | Supported |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XXYY_API_KEY` | Yes | Your XXYY Open API Key (`xxyy_ak_xxxx`) |
| `XXYY_API_BASE_URL` | No | API base URL, defaults to `https://www.xxyy.io` |

## Verification

After configuration, restart your AI client and use the `ping` tool:

```
> ping
pong — API Key is valid.
```

## Security Notes

- **API Key = Wallet access** — Your XXYY API Key can execute real on-chain trades using your wallet balance. If it leaks, anyone can buy/sell tokens with your funds. Never share it, never commit it to version control, never paste it in public channels. If you suspect a leak, regenerate the key immediately at https://xxyy.io.
- **Custodial model** — XXYY executes trades using your wallet balance. No private keys or wallet signing needed.
- **No read-only mode** — The same key is used for both data queries and trading.
- **No automatic status polling** — After `buy_token` / `sell_token` submits an order, the server returns the transaction ID but does NOT automatically poll for results. Use `query_trade` to check the transaction status manually.
- **IP whitelist (recommended)** — For extra security, configure an IP whitelist for your API Key at [xxyy.io/apikey](https://www.xxyy.io/apikey). Only whitelisted IPs will be allowed to call the API. Use the `get_ip` tool to check your current outbound IP before setting up the whitelist.

## Supported Chains

| Chain | Native Token | Trading | Feed Scan |
|-------|-------------|---------|-----------|
| Solana (`sol`) | SOL | Yes | Yes |
| Ethereum (`eth`) | ETH | Yes | No |
| BSC (`bsc`) | BNB | Yes | Yes |
| Base (`base`) | ETH | Yes | No |

## Development

```bash
git clone https://github.com/Jimmy-Holiday/xxyy-trade-skill.git
cd xxyy-trade-skill/mcp
npm install
npm run build
```

Test with MCP Inspector:

```bash
XXYY_API_KEY=xxyy_ak_xxx npx @modelcontextprotocol/inspector node dist/index.js
```

## License

[MIT](../LICENSE)
