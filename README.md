# XXYY Trade Skill

Trade tokens on **Solana**, **Ethereum**, **BSC**, and **Base** chains via [XXYY](https://www.xxyy.io) Open API -- using natural language. Supports both **Claude Code** and **OpenClaw**.

## Install

### Claude Code

**Step 1** — Add the marketplace source:

```bash
/plugin marketplace add Jimmy-Holiday/xxyy-trade-skill
```

**Step 2** — Install the plugin:

Open `/plugin` → switch to **Marketplaces** tab → select **xxyy-trade-skill** → **Browse plugins** → install **xxyy-trade**.

> **Troubleshooting:** If the marketplace doesn't appear in the Marketplaces tab after Step 1 succeeds, exit the `/plugin` UI and re-open it.

Or manually: copy `skills/xxyy-trade/` into your project's `.claude/skills/` directory.

### OpenClaw

Paste the repo URL in your OpenClaw conversation:

```
https://github.com/Jimmy-Holiday/xxyy-trade-skill
```

Or via ClawHub CLI:

```bash
clawhub install xxyy-trade
```

## Setup

Export your XXYY API Key before use:

```bash
export XXYY_API_KEY=xxyy_ak_your_key_here
```

Get an API Key at [xxyy.io](https://www.xxyy.io) (Settings > API Keys).

Optionally set a custom base URL:

```bash
export XXYY_API_BASE_URL=https://www.xxyy.io
```

## Usage

Once installed, simply tell Claude what you want to trade:

- `"buy 0.1 SOL of <token_address>"`
- `"sell 50% of <token_address> on BSC"`
- `"check trade status <txId>"`
- `"ping xxyy api"`

The skill will confirm trade details with you before executing.

## Supported Chains

| Chain | Native Token |
|-------|-------------|
| Solana (`sol`) | SOL |
| Ethereum (`eth`) | ETH |
| BSC (`bsc`) | BNB |
| Base (`base`) | ETH |

## License

[MIT](LICENSE)
