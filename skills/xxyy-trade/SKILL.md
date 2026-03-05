---
name: xxyy-trade
description: >-
  This skill should be used when the user asks to "buy token", "sell token",
  "swap token", "trade crypto", "check trade status", "query transaction",
  or mentions trading on Solana/ETH/BSC/Base chains via XXYY.
  Enables on-chain token trading through the XXYY Open API.
version: 1.0.0
disabled-model-invocation: true
allowed-tools: Bash, Read, AskUserQuestion
---

# XXYY Trade

On-chain token trading on Solana, Ethereum, BSC, and Base via XXYY Open API.

## Prerequisites

Set environment variables before use:
- `XXYY_API_KEY` (required) -- Your XXYY Open API Key (format: `xxyy_ak_xxxx`). Get one at https://www.xxyy.io
- `XXYY_API_BASE_URL` (optional) -- API base URL, defaults to `https://www.xxyy.io`

## Authentication

All requests require header: `Authorization: Bearer $XXYY_API_KEY`

## API Reference

### Buy Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/swap`

```json
{
  "chain": "sol",
  "walletAddress": "<user_wallet>",
  "tokenAddress": "<token_contract>",
  "isBuy": true,
  "amount": 0.1,
  "slippage": 20,
  "tip": 0.001
}
```

Parameters:
- `chain` -- `sol` / `eth` / `bsc` / `base`
- `walletAddress` -- User's wallet address on XXYY platform (the address user can operate on xxyy.io). Must match the selected chain.
- `tokenAddress` -- Token contract address to buy
- `amount` -- Amount in native currency (SOL/ETH/BNB)
- `slippage` -- Slippage tolerance %, default 20
- `model` -- 1=anti-sandwich (default), 0=normal
- `tip` -- Jito tip, SOL chain only, default 0.001

### Sell Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/swap`

```json
{
  "chain": "sol",
  "walletAddress": "<user_wallet>",
  "tokenAddress": "<token_contract>",
  "isBuy": false,
  "amount": 50
}
```

- `amount` -- Sell percentage (0-100). Example: 50 = sell 50% of holdings

### Query Trade
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/trade?txId=<tx_id>`

Response fields: txId, status (pending/success/failed), statusDesc, chain, tokenAddress, walletAddress, isBuy, baseAmount, quoteAmount

### Ping
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/ping`

Returns "pong" if API key is valid.

## Execution Rules

1. **Always confirm before trading** -- Ask user to confirm: chain, token address, amount/percentage, buy or sell
2. **Use Bash with curl** to call the API
3. **Poll trade result** -- After swap submission, query trade status up to 3 times with 5s intervals
4. **Show transaction link** -- Always display the block explorer URL with the txId
5. **Never retry** failed swap requests -- show the error to user instead
6. **Chain-wallet validation** -- walletAddress must match the selected chain. A Solana wallet cannot be used for BSC/ETH/Base trades and vice versa. If the user provides a mismatched wallet/chain combination, warn them and ask to correct before proceeding.

## Wallet Address Formats

| Chain | Format | Example pattern |
|-------|--------|-----------------|
| SOL | Base58, 32-44 characters | `7xKX...` |
| ETH / BSC / Base | 0x + 40 hex characters | `0x1a2B...` |

## Block Explorer URLs
- SOL: `https://solscan.io/tx/{txId}`
- ETH: `https://etherscan.io/tx/{txId}`
- BSC: `https://bscscan.com/tx/{txId}`
- BASE: `https://basescan.org/tx/{txId}`

## Error Codes
| Code | Meaning |
|------|---------|
| 8060 | API Key invalid |
| 8061 | API Key disabled |
| 8062 | Rate limited (retry after 1s) |

## Example curl

```bash
# Buy
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/swap" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain":"sol","walletAddress":"...","tokenAddress":"...","isBuy":true,"amount":0.1}'

# Query
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/open/api/trade?txId=..." \
  -H "Authorization: Bearer $XXYY_API_KEY"
```
