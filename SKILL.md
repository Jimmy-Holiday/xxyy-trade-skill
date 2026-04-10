---
name: xxyy-trade
description: >-
  This skill should be used when the user asks to "buy token", "sell token",
  "swap token", "trade crypto", "check trade status", "query transaction",
  "scan tokens", "feed", "monitor chain", "query token", "token details",
  "check token safety", "list wallets", "show wallets", "my wallets",
  "AI scan", "AI扫链", "auto scan", "smart scan", "tweet scan", "推文扫链",
  "twitter scan", "onboarding", "get started",
  "check IP", "get IP", "IP whitelist", "查IP", "IP白名单",
  "launch token", "create token", "发币", "创建代币",
  "auto sell", "stop loss", "take profit", "trailing stop", "止盈止损", "移动止损",
  "holders", "top holders", "kol holders", "insider", "持仓", "持仓列表",
  or mentions trading on Solana/ETH/BSC/Base chains via XXYY.
  Enables on-chain token trading and data queries through the XXYY Open API.
version: 1.5.1
allowed-tools: Bash, Read, AskUserQuestion
metadata: { "openclaw": { "requires": { "env": ["XXYY_API_KEY"], "bins": ["curl"] }, "primaryEnv": "XXYY_API_KEY", "emoji": "💹", "homepage": "https://www.xxyy.io" } }
---

# XXYY Trade

On-chain token trading and data queries on Solana, Ethereum, BSC, and Base via XXYY Open API.

## Prerequisites

Set environment variables before use:
- `XXYY_API_KEY` (required) -- Your XXYY Open API Key (format: `xxyy_ak_xxxx`). Get one at https://www.xxyy.io/apikey
- `XXYY_API_BASE_URL` (optional) -- API base URL, defaults to `https://www.xxyy.io`

## Authentication

All requests require header: `Authorization: Bearer $XXYY_API_KEY`

## Security Notes

> **⚠ READ BEFORE FIRST USE.** This skill executes **real on-chain trades** with real funds. There is **no read-only API key** — the same key signs both data queries and trades. Treat your `XXYY_API_KEY` like a hot wallet private key. The skill will surface a one-time risk acknowledgement on your first trade each session; after that, only trade details are confirmed so trading stays fast.

- **⚠️ API Key = Wallet access** -- Your XXYY API Key can execute real on-chain trades using your wallet balance. If it leaks, anyone can buy/sell tokens with your funds. Never share it, never commit it to version control, never expose it in logs or public channels. If you suspect a leak, regenerate the key immediately at https://xxyy.io.
- **Custodial trading model** -- XXYY is a custodial trading platform. You only provide your wallet address (public key) and API Key. No private keys or wallet signing are needed -- XXYY executes trades on your behalf through their platform.
- **No read-only mode** -- The same API Key is used for both data queries (Feed, Token Query) and trading (Buy, Sell). There is currently no separate read-only key.
- **IP whitelist (recommended)** -- For extra security, configure an IP whitelist for your API Key at https://www.xxyy.io/apikey. Only whitelisted IPs can call the API. Use the `get_ip` tool to check your current outbound IP before setting up the whitelist.

## API Reference

> **STRICT: Only the endpoints listed below exist. Do NOT guess, infer, or construct any URL that is not explicitly documented here. If you need functionality not covered below, tell the user it is not supported.**
>
> Complete endpoint list:
> - `POST /api/trade/open/api/swap` — Buy / Sell
> - `GET  /api/trade/open/api/trade` — Query Trade
> - `GET  /api/trade/open/api/ping` — Ping
> - `POST /api/trade/open/api/feed/{type}` — Feed Scan
> - `GET  /api/trade/open/api/query` — Token Query
> - `GET  /api/trade/open/api/wallets` — List Wallets
> - `GET  /api/trade/open/api/wallet/info` — Wallet Info
> - `GET  /api/trade/open/api/pnl` — PNL Query
> - `GET  /api/trade/open/api/trades` — Trade History
> - `GET  /api/trade/open/api/ip` — Get IP (exempt from IP whitelist)
> - `GET  /api/trade/open/api/kol-buy-list` — KOL Buy List
> - `GET  /api/trade/open/api/tag-holder-buy-list` — Tag Holder Buy List
> - `GET  /api/trade/open/api/label-list` — Label List (tokens with specific labels, SOL only)
> - `POST /api/trade/open/api/signal-list` — Signal List (AI trending signals, SOL/BSC)
> - `POST /api/trade/open/api/trending-list` — Trending List (hot tokens by period, SOL/BSC)
> - `POST /api/trade/open/api/{chain}/launch` — Launch Token (create new token, SOL/BSC)
> - `POST /api/trade/open/api/autoSell/createOrUpdate` — Create/Update Auto-Sell Rules
> - `GET  /api/trade/open/api/autoSell/list` — List Auto-Sell Rules
> - `GET  /api/trade/open/api/autoSell/delete` — Delete Auto-Sell Rules
> - `GET  /api/trade/open/api/autoSell/open` — Toggle Auto-Sell
> - `GET  /api/trade/open/api/holders/{type}` — Token Holder List

### Buy Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/swap`

```json
{
  "chain": "sol",
  "walletAddress": "<user_wallet>",
  "tokenAddress": "<token_contract>",
  "isBuy": true,
  "amount": 0.1,
  "tip": 0.0001,
  "slippage": 20
}
```

#### Buy Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Only these 4 values accepted |
| `walletAddress` | YES | string | SOL: Base58 32-44 chars; EVM: 0x+40hex | Wallet address on XXYY platform, must match chain |
| `tokenAddress` | YES | string | Valid contract address | Token contract address to buy |
| `isBuy` | YES | boolean | `true` | Must be true for buy |
| `amount` | YES | number | > 0 | Amount in native currency (SOL/ETH/BNB) |
| `tip` | YES | number | SOL: 0.0001-0.1 (unit: SOL); EVM: 0.1-100 (unit: Gwei) | Priority fee for all chains. If not provided, falls back to priorityFee |
| `slippage` | NO | number | 0-100 | Slippage tolerance %, default 20 |
| `model` | NO | number | 1 or 2 | 1=anti-sandwich (default), 2=fast mode |
| `priorityFee` | NO | number | >= 0 | Solana chain only. Extra priority fee in addition to tip |

### Sell Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/swap`

```json
{
  "chain": "sol",
  "walletAddress": "<user_wallet>",
  "tokenAddress": "<token_contract>",
  "isBuy": false,
  "amount": 50,
  "tip": 0.0001
}
```

#### Sell Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Only these 4 values accepted |
| `walletAddress` | YES | string | SOL: Base58 32-44 chars; EVM: 0x+40hex | Wallet address on XXYY platform, must match chain |
| `tokenAddress` | YES | string | Valid contract address | Token contract address to sell |
| `isBuy` | YES | boolean | `false` | Must be false for sell |
| `amount` | YES | number | 1-100 | Sell percentage. Example: 50 = sell 50% of holdings |
| `tip` | YES | number | SOL: 0.0001-0.1 (unit: SOL); EVM: 0.1-100 (unit: Gwei) | Priority fee for all chains. If not provided, falls back to priorityFee |
| `slippage` | NO | number | 0-100 | Slippage tolerance %, default 20 |
| `model` | NO | number | 1 or 2 | 1=anti-sandwich (default), 2=fast mode |
| `priorityFee` | NO | number | >= 0 | Solana chain only. Extra priority fee in addition to tip |

### tip / priorityFee Rules

- `tip` (required) -- Universal priority fee for ALL chains. EVM chains (eth/bsc/base) use tip as the priority fee. If tip is not provided, the API falls back to priorityFee.
  - SOL chain: unit is SOL (1 = 1 SOL, very expensive). Recommended range: 0.0001 - 0.1
  - EVM chains (eth/bsc/base): unit is Gwei. Recommended range: 0.1 - 100
- `priorityFee` (optional) -- Only effective on Solana chain. Solana supports both tip and priorityFee simultaneously.

### Query Trade
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trade?txId=<tx_id>`

Response fields: txId, status (pending/success/failed), statusDesc, chain, tokenAddress, walletAddress, isBuy, baseAmount, quoteAmount

### Trade History
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trades?walletAddress=<wallet>&chain=<chain>`

Paginated query of successful trade records for a specific wallet. Only returns completed transactions, sorted by creation time (newest first).

#### Trade History Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | Must belong to current API Key user |
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Chain identifier (required) |
| `tokenAddress` | NO | string | Contract address | Filter by specific token |
| `pageNum` | NO | int | >= 1 | Page number, default 1 |
| `pageSize` | NO | int | 1-20 | Items per page, default 20 |

#### Trade History Response

```json
{
  "code": 200,
  "data": {
    "pageNum": 1,
    "pageSize": 10,
    "total": 56,
    "list": [
      {
        "txId": "5xYz...",
        "status": 2,
        "statusDesc": "success",
        "chain": "sol",
        "tokenAddress": "EPjF...",
        "walletAddress": "5xYz...",
        "isBuy": 1,
        "baseAmount": 0.5,
        "quoteAmount": 1000,
        "createTime": "2026-03-18T10:00:00",
        "updateTime": "2026-03-18T10:00:05"
      }
    ]
  }
}
```

Response fields: txId, status (fixed 2=success), statusDesc, chain, tokenAddress, walletAddress, isBuy (1=buy, 0=sell), baseAmount, quoteAmount, createTime, updateTime

### Ping
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/ping`

Returns "pong" if API key is valid.

### Feed (Scan Tokens)
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/feed/{type}?chain={chain}`

Retrieve Meme token lists: newly launched, almost graduated, or graduated.

#### Path & Query Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `type` | YES | path string | `NEW` / `ALMOST` / `COMPLETED` | NEW = newly launched, ALMOST = almost graduated, COMPLETED = graduated |
| `chain` | NO | query string | `sol` / `bsc` | Only these 2 chains supported. Default `sol` |

#### Body (Filter Parameters)

All filters are optional. Range parameters use comma-separated string format `"min,max"`. Leave one side empty to set only min or max (e.g. `"100,"` = min 100, `",50"` = max 50).

| Param | Type | Description | Example |
|-------|------|-------------|---------|
| `dex` | string[] | DEX platform filter | See DEX Values by Chain below |
| `quoteTokens` | string[] | Quote token filter | See quoteTokens Values by Chain below |
| `link` | string[] | Social media link filter | `["x","tg","web"]` |
| `keywords` | string[] | Token name/symbol keyword match | `["pepe","doge"]` |
| `ignoreWords` | string[] | Ignore keywords | `["scam"]` |
| `mc` | string | Market cap range (USD) | `"10000,500000"` |
| `liq` | string | Liquidity range (USD) | `"1000,"` |
| `vol` | string | Trading volume range (USD) | `"5000,100000"` |
| `holder` | string | Holder count range | `"50,"` |
| `createTime` | string | Creation time range (minutes from now) | `"1,20"` |
| `tradeCount` | string | Trade count range | `"100,"` |
| `buyCount` | string | Buy count range | `"50,"` |
| `sellCount` | string | Sell count range | `"10,"` |
| `devBuy` | string | Dev buy amount range (native token) | `"0.001,"` |
| `devSell` | string | Dev sell amount range (native token) | `"0.001,"` |
| `devHp` | string | Dev holding % range | `",60"` |
| `topHp` | string | Top10 holding % range | `",60"` |
| `insiderHp` | string | Insider holding % range | `",50"` |
| `bundleHp` | string | Bundle holding % range | `",60"` |
| `newWalletHp` | string | New wallet holding % range | `",30"` |
| `progress` | string | Graduation progress % range (NEW/ALMOST only) | `"1,90"` |
| `snipers` | string | Sniper count range | `",5"` |
| `xnameCount` | string | Twitter rename count range | `",3"` |
| `tagHolder` | string | Watched wallet buy count range | `"1,2"` |
| `kol` | string | KOL buy count range | `"1,2"` |
| `dexPay` | int | DexScreener paid, `1` = filter paid only | `1` |
| `oneLink` | int | At least one social link, `1` = enabled | `1` |
| `live` | int | Currently live streaming, `1` = filter live | `1` |

#### DEX Values by Chain

- **SOL**: `pump`, `pumpmayhem`, `bonk`, `heaven`, `believe`, `daosfun`, `launchlab`, `mdbc`, `jupstudio`, `mdbcbags`, `trends`, `moonshotn`, `boop`, `moon`, `time`
- **BSC**: `four`, `four_agent`, `bnonly`, `flap`

#### quoteTokens Values by Chain

- **SOL**: `sol`, `usdc`, `usd1`
- **BSC**: `bnb`, `usdt`, `usdc`, `usd1`, `aster`, `u`

#### Feed Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "items": [
      {
        "tokenAddress": "...",
        "symbol": "TOKEN",
        "name": "Token Name",
        "createTime": 1773140232851,
        "dexName": "PUMPFUN",
        "launchPlatform": { "name": "PUMPFUN", "progress": "12.89", "completed": false },
        "holders": 3,
        "priceUSD": 0.000003046,
        "marketCapUSD": 3046.80,
        "devHoldPercent": 12.48,
        "hasLink": false,
        "snipers": 0,
        "quoteToken": "sol"
      }
    ]
  },
  "success": true
}
```

Key response fields: `tokenAddress`, `symbol`, `name`, `createTime`, `dexName`, `launchPlatform` (name/progress/completed), `holders`, `priceUSD`, `marketCapUSD`, `devHoldPercent`, `hasLink`, `snipers`, `volume`, `tradeCount`, `buyCount`, `sellCount`, `topHolderPercent`, `insiderHp`, `bundleHp`

### Token Query
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/query?ca={contract_address}&chain={chain}`

Query token details: price, security checks, tax rates, holder distribution, etc.

#### Token Query Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `ca` | YES | string | Contract address | Token contract address |
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol`. All 4 chains supported |

#### Token Query Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "chainId": "bsc",
    "tokenAddress": "0x...",
    "baseSymbol": "TOKEN",
    "tradeInfo": {
      "marketCapUsd": 15464629.87,
      "price": 0.01546,
      "holder": 7596,
      "hourTradeNum": 20611,
      "hourTradeVolume": 2564705.05
    },
    "pairInfo": {
      "pairAddress": "0x...",
      "pair": "TOKEN - WBNB",
      "liquidateUsd": 581750.57,
      "createTime": 1772182240000
    },
    "securityInfo": {
      "honeyPot": false,
      "openSource": true,
      "noOwner": true,
      "locked": true
    },
    "taxInfo": { "buy": "0", "sell": "0" },
    "linkInfo": { "tg": "", "x": "", "web": "" },
    "dev": { "address": "0x...", "pct": 0.0 },
    "topHolderPct": 25.14,
    "topHolderList": [
      { "address": "0x...", "balance": 98665702.34, "pct": 9.86 }
    ]
  },
  "success": true
}
```

Response groups:
- **tradeInfo**: marketCapUsd, price, holder, hourTradeNum, hourTradeVolume
- **pairInfo**: pairAddress, pair, liquidateUsd, createTime
- **securityInfo**: honeyPot, openSource, noOwner, locked
- **taxInfo**: buy, sell (percentage strings)
- **dev**: address, pct
- **topHolderPct** and **topHolderList**: top 10 holder distribution

### List Wallets
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallets`

Query the current user's wallet list (with balances) for a specific chain.

#### Wallets Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol` |
| `pageNum` | NO | int | >= 1 | Page number, default 1 |
| `pageSize` | NO | int | 1-20 | Items per page, default 20 |
| `tokenAddress` | NO | string | Contract address | Returns token holdings per wallet |

#### Wallets Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "totalCount": 3,
    "pageSize": 20,
    "totalPage": 1,
    "currPage": 1,
    "list": [
      {
        "userId": 12345,
        "chain": 1,
        "name": "Wallet-1",
        "address": "5xYz...abc",
        "balance": 1.523456789,
        "topUp": 1,
        "tokenBalance": null,
        "createTime": "2025-01-01 00:00:00",
        "updateTime": "2025-06-01 12:00:00",
        "isImport": false
      }
    ]
  },
  "success": true
}
```

Response fields:
- **totalCount**: Total wallet count
- **list[].chain**: Chain code (1=SOL, 2=BSC, 3=ETH, 6=BASE)
- **list[].name**: Wallet display name
- **list[].address**: Wallet address
- **list[].balance**: Native token balance
- **list[].topUp**: 1=pinned, 0=normal
- **list[].tokenBalance**: Token holdings (only present when `tokenAddress` is provided). Contains `amount`, `decimals`, `uiAmount`, `uiAmountString`
- **list[].isImport**: Whether the wallet was imported

#### Chain Codes

| Code | Chain |
|------|-------|
| 1 | SOL |
| 2 | BSC |
| 3 | ETH |
| 6 | BASE |

### Wallet Info
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallet/info`

Query a single wallet's details (native balance + optional token balance).

#### Wallet Info Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | EVM chains are case-insensitive |
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol` |
| `tokenAddress` | NO | string | Contract address | Returns token holdings for this token |

#### Wallet Info Response

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "address": "5xY...abc",
    "name": "MyWallet",
    "chain": 1,
    "isImport": false,
    "topUp": 0,
    "balance": 1.234567,
    "tokenBalance": {
      "amount": "1000000",
      "uiAmount": 1.0,
      "decimals": 6
    }
  },
  "success": true
}
```

Response fields:
- **address**: Wallet address
- **name**: Wallet display name
- **chain**: Chain code (1=SOL, 2=BSC, 3=ETH, 6=BASE)
- **balance**: Native token balance
- **topUp**: 1=pinned, 0=normal
- **isImport**: Whether the wallet was imported
- **tokenBalance**: Only present when `tokenAddress` is provided. Contains `amount`, `uiAmount`, `decimals`

### PNL Query
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/pnl?walletAddress=<wallet>&tokenAddress=<token>&chain=<chain>`

Query PNL (profit and loss) data for a specific wallet-token pair. Returns buy/sell totals, current holdings, and profit in both native currency and USD. Covers the last 30 days.

#### PNL Query Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | Must belong to current API Key user |
| `tokenAddress` | YES | string | Contract address | Token contract address |
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Chain identifier (required) |

#### PNL Query Response

```json
{
  "code": 200,
  "data": {
    "wallet": "5xYz...",
    "tokenMint": "EPjF...",
    "balance": 1.5,
    "buy": 2.0,
    "sell": 0.8,
    "hold": 1.2,
    "pnl": 0.5,
    "pnlusd": 75.0,
    "holdTokenNum": 1000,
    "holdTokenPercent": 0.05,
    "lastTradeTime": 1710000000000,
    "meta": {
      "symbol": "TOKEN",
      "dexId": "raydium",
      "pairAddress": "xxx"
    }
  }
}
```

Response fields:
- **wallet**: Wallet address
- **tokenMint**: Token contract address
- **balance**: Native token balance (e.g. SOL)
- **buy**: Total buy amount (native currency)
- **sell**: Total sell amount (native currency)
- **hold**: Current holding value (native currency)
- **pnl**: Profit/loss (native currency)
- **pnlusd**: Profit/loss (USD)
- **holdTokenNum**: Current token holdings quantity
- **holdTokenPercent**: Holdings as percentage of total supply
- **lastTradeTime**: Last trade timestamp (milliseconds)
- **meta.symbol**: Token symbol
- **meta.dexId**: DEX identifier
- **meta.pairAddress**: Trading pair address

### Get IP
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/ip`

Get the current outbound IP address of this server. Use this to check which IP to add to your API Key's whitelist. **This endpoint is exempt from IP whitelist restrictions** — it will work even if your IP is not whitelisted.

No parameters required.

#### Get IP Response

```json
{
  "code": 200,
  "data": {
    "ip": "203.0.113.42"
  },
  "success": true
}
```

Response fields:
- **ip**: Your current outbound IP address

### KOL Buy List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/kol-buy-list?chain={chain}`

Get KOL (Key Opinion Leader) recent buy list. Shows tokens recently purchased by influential traders.

#### KOL Buy List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Only SOL and BSC supported |

#### KOL Buy List Response

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "tokenMeta": {
        "symbol": "TOKEN",
        "dexId": "pump",
        "dexIcon": "https://...",
        "imageUrl": "https://...",
        "pairAddress": "PairAddress...",
        "mint": "TokenMintAddress..."
      },
      "priceNative": 0.0000001,
      "priceUsd": 0.0000085,
      "marketCap": 8500.0,
      "priceChange24h": 15.0,
      "walletBuyCnt": 2,
      "lastTradeTime": 1711234567890,
      "holder": 120,
      "volumeNative": 5000.0,
      "volumeUSD": 5000.0,
      "walletBuyItemList": [
        {
          "wallet": "KolWalletAddress...",
          "walletName": "KOL Name",
          "walletBuyAmount": 1.5
        }
      ]
    }
  ]
}
```

Response fields:
- **tokenMeta.symbol**: Token symbol
- **tokenMeta.mint**: Token contract address
- **tokenMeta.dexId**: DEX identifier
- **tokenMeta.pairAddress**: Trading pair address
- **tokenMeta.imageUrl**: Token logo URL
- **priceNative**: Price in native currency
- **priceUsd**: Price in USD
- **marketCap**: Market capitalization in USD
- **priceChange24h**: 24-hour price change percentage
- **walletBuyCnt**: Number of KOL wallets that bought
- **lastTradeTime**: Last trade timestamp (milliseconds)
- **holder**: Number of holders
- **walletBuyItemList[].wallet**: KOL wallet address
- **walletBuyItemList[].walletName**: KOL wallet name
- **walletBuyItemList[].walletBuyAmount**: Buy amount in native currency

### Tag Holder Buy List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/tag-holder-buy-list?chain={chain}`

Get tag holder (Smart Money, Whale, etc.) recent buy list. Shows tokens recently purchased by tagged wallets.

#### Tag Holder Buy List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Only SOL and BSC supported |

#### Tag Holder Buy List Response

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "tokenMeta": {
        "symbol": "TOKEN",
        "dexId": "pump",
        "dexIcon": "https://...",
        "imageUrl": "https://...",
        "pairAddress": "PairAddress...",
        "mint": "TokenMintAddress..."
      },
      "priceNative": 0.0000001,
      "priceUsd": 0.0000085,
      "marketCap": 8500.0,
      "priceChange24h": -5.0,
      "walletBuyCnt": 1,
      "lastTradeTime": 1711234567890,
      "holder": 250,
      "volumeNative": 12000.0,
      "volumeUSD": 12000.0,
      "walletBuyItemList": [
        {
          "wallet": "HolderWalletAddress...",
          "walletName": "Smart Money",
          "walletBuyAmount": 2.5
        }
      ]
    }
  ]
}
```

Response fields:
- **tokenMeta.symbol**: Token symbol
- **tokenMeta.mint**: Token contract address
- **tokenMeta.dexId**: DEX identifier
- **tokenMeta.pairAddress**: Trading pair address
- **tokenMeta.imageUrl**: Token logo URL
- **priceNative**: Price in native currency
- **priceUsd**: Price in USD
- **marketCap**: Market capitalization in USD
- **priceChange24h**: 24-hour price change percentage
- **walletBuyCnt**: Number of tagged wallets that bought
- **lastTradeTime**: Last trade timestamp (milliseconds)
- **holder**: Number of holders
- **walletBuyItemList[].wallet**: Holder wallet address
- **walletBuyItemList[].walletName**: Holder wallet name / tag
- **walletBuyItemList[].walletBuyAmount**: Buy amount in native currency

### Label List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/label-list?chain={chain}&labelType={labelType}`

Get tokens with specific labels (e.g., AGENT_KOL marked tokens). Currently only supports Solana chain.

#### Label List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Supports SOL and BSC |
| `labelType` | NO | string | `AGENT_KOL` | Default `AGENT_KOL`. Currently only AGENT_KOL supported |

#### Label List Response

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "pairAddress": "PairAddress...",
      "dexId": "raydium",
      "dexName": "Raydium",
      "symbol": "TOKEN",
      "name": "Token Name",
      "tokenAddress": "TokenAddress...",
      "imageUrl": "https://...",
      "priceUSD": "0.00123",
      "marketCapUSD": "123456.78",
      "priceChange24H": "15.5",
      "launchFrom": "pump",
      "links": {
        "tg": "https://t.me/...",
        "x": "https://x.com/...",
        "web": "https://..."
      }
    }
  ],
  "success": true
}
```

Response fields:
- **pairAddress**: Trading pair address
- **dexId**: DEX identifier
- **dexName**: DEX name
- **symbol**: Token symbol
- **name**: Token name
- **tokenAddress**: Token contract address
- **imageUrl**: Token logo URL
- **priceUSD**: Current price in USD
- **marketCapUSD**: Market capitalization in USD
- **priceChange24H**: 24-hour price change percentage
- **launchFrom**: Launch platform
- **links**: Social media links (Telegram, X/Twitter, Website)

### Signal List
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/signal-list?type={type}&chain={chain}`

Get AI trend signal list (e.g., open-ai-trending tokens). Supports SOL and BSC chains.

#### Signal List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `type` | NO | string | `open-ai-trending` | Default `open-ai-trending`. Currently only open-ai-trending supported |
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Supports SOL and BSC |

Request body: Empty JSON object `{}`

#### Signal List Response

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "pairAddress": "PairAddress...",
      "dexId": "raydium",
      "dexName": "Raydium",
      "symbol": "TOKEN",
      "name": "Token Name",
      "tokenAddress": "TokenAddress...",
      "imageUrl": "https://...",
      "priceUSD": "0.00456",
      "marketCapUSD": "456789.12",
      "priceChange24H": "-5.2",
      "launchFrom": "pump",
      "links": {
        "tg": "https://t.me/...",
        "x": "https://x.com/...",
        "web": "https://..."
      }
    }
  ],
  "success": true
}
```

Response fields: Same as Label List (see above)

### Trending List
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trending-list?chain={chain}`

Get trending/hot token list. Shows the most active tokens within a given time period. Supports SOL and BSC chains.

#### Trending List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Only SOL and BSC supported |
| `period` | YES | string | `1M` / `5M` / `30M` / `1H` / `6H` / `24H` | Time period for trending. Not all periods available for all internal categories |

Request body:
```json
{ "period": "5M" }
```

#### Trending List Response

```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "imageUrl": "https://...",
      "createTime": "1774581395318",
      "symbol": "TOKEN",
      "name": "Token Name",
      "dexId": "pfamm",
      "headerImage": "https://...",
      "pairAddress": "PairAddress...",
      "tokenAddress": "TokenMintAddress...",
      "priceUSD": "0.00005670",
      "priceChange24H": "98.00",
      "launchPlatform": {
        "name": "PUMP",
        "progress": 85,
        "completed": false,
        "launchedPair": null
      },
      "dexName": "Pump AMM",
      "dexIcon": "https://...",
      "marketCapUSD": "56708.41",
      "links": { "tg": "", "x": "https://x.com/...", "web": "" },
      "security": {
        "mintAuthority": { "value": false, "passed": true },
        "freezeAuthority": { "value": false, "passed": true },
        "topHolder": { "value": 18.61, "passed": false },
        "lpBurned": { "value": 100.0, "passed": true }
      },
      "holders": 641,
      "devHoldPercent": "0.0000000000000",
      "smartWallets": { "total": 3, "records": [{ "wallet": "...", "action": "buy", "nativeAmount": "1.5" }] },
      "sourceDexIcon": "https://...",
      "launchFrom": "pump",
      "extendFlags": { "live": false },
      "volume": 142092.91,
      "liquid": 20995.35,
      "buyCount": 2123,
      "sellCount": 1620,
      "auditInfo": {
        "devHp": 0,
        "snipers": 20,
        "insiderHp": 0,
        "newHp": 10.63,
        "bundleHp": 0,
        "dexPaid": true
      }
    }
  ]
}
```

Response fields:
- **imageUrl**: Token logo URL
- **createTime**: Trading pair creation timestamp (milliseconds)
- **symbol**: Token symbol
- **name**: Token name
- **tokenAddress**: Token contract address
- **pairAddress**: Trading pair address
- **priceUSD**: Current price in USD
- **priceChange24H**: 24-hour price change percentage
- **marketCapUSD**: Market capitalization in USD
- **volume**: Trading volume
- **liquid**: Liquidity
- **buyCount**: Buy transaction count
- **sellCount**: Sell transaction count
- **holders**: Number of holders
- **devHoldPercent**: Developer holding percentage
- **dexName**: DEX pool name
- **launchFrom**: Launch platform identifier
- **launchPlatform**: Launch platform details (name, progress, completed, launchedPair)
- **links**: Social media links (tg, x, web)
- **security**: Security info — mintAuthority, freezeAuthority (value=bool, passed=bool), topHolder, lpBurned (value=number, passed=bool)
- **smartWallets**: Smart wallet activity (total count + recent records with wallet/action/nativeAmount)
- **extendFlags.live**: Whether token is currently live streaming
- **auditInfo**: Audit details — devHp (dev holding %), snipers count, insiderHp, newHp (new wallet holding %), bundleHp, dexPaid (DexScreener paid)

### Launch Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/{chain}/launch`

Launch (create) a new token on SOL or BSC chain. Optionally buy an initial amount of the newly created token.

#### Path Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | YES | string | `sol` / `bsc` | Only SOL and BSC supported |

#### Launch Request Body

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `walletAddress` | YES | string | Wallet address (must belong to the API Key's account) |
| `name` | YES | string | Token name |
| `symbol` | YES | string | Token symbol |
| `buyAmount` | NO | string | Native token amount for initial buy. "0" = create only. Default: "0" |
| `solOptions` | Sol only | object | Solana chain specific options (see below) |
| `bscOptions` | BSC only | object | BSC chain specific options (see below) |

**buyAmount Limits:**
- SOL: max 100 SOL, min balance = buyAmount + 0.01 SOL
- BSC: max 20 BNB, min balance = buyAmount + 0.015 BNB

#### solOptions (chain=sol)

| Param | Required | Type | Default | Description |
|-------|----------|------|---------|-------------|
| `uri` | YES | string | - | Metadata JSON URI (Metaplex standard, containing name/symbol/description/image) |
| `slippage` | NO | integer | 100 | Slippage in basis points. 100 = 1%. Only effective when buyAmount > 0 |
| `priorityFee` | NO | long | 100000 | Priority fee in lamports |
| `tipFee` | NO | long | 100000 | Tip fee in lamports |
| `model` | NO | integer | 1 | 1 = MEV protection, 2 = fast mode |
| `creator` | NO | string | null | Creator address (base58). Defaults to signing wallet |
| `mayhemMode` | NO | boolean | false | Pump mayhem mode |
| `cashback` | NO | boolean | false | Pump cashback |

> Platform fee (1%) is charged automatically when buyAmount > 0, not configurable.

#### bscOptions (chain=bsc)

| Param | Required | Type | Default | Description |
|-------|----------|------|---------|-------------|
| `desc` | YES | string | - | Token description |
| `image` | YES | string | - | Image URL / base64 / data URI (≤5MB) |
| `label` | NO | string | "Meme" | Category: Meme, AI, Defi, Games, Infra, De-Sci, Social, Depin, Charity, Others |
| `gasPrice` | NO | string | null | Custom gas price (wei). Auto-fetched if not provided |
| `model` | NO | integer | 1 | 1 = MEV protection (bundle), 2 = fast mode |
| `feePlan` | NO | boolean | false | Fee plan toggle |
| `webUrl` | NO | string | "" | Website URL |
| `twitterUrl` | NO | string | "" | Twitter URL |
| `telegramUrl` | NO | string | "" | Telegram URL |
| `tokenTaxInfo` | NO | object | null | Token tax configuration (see below) |

#### tokenTaxInfo (BSC only)

| Param | Required | Type | Description |
|-------|----------|------|-------------|
| `feeRate` | YES | integer | Trading fee rate. Fixed options: 1, 3, 5, 10 (representing 1%-10%) |
| `burnRate` | YES | integer | Burn rate (0-100) |
| `divideRate` | YES | integer | Dividend distribution rate (0-100) |
| `liquidityRate` | YES | integer | Liquidity pool rate (0-100) |
| `recipientRate` | YES | integer | Recipient allocation rate (0-100) |
| `minSharing` | Conditional | long | Min token amount for dividend participation (in ether). Required when divideRate > 0. Format: d × 10^n (n≥5, 1≤d≤9) |
| `recipientAddress` | Conditional | string | Recipient address (0x...). Required when recipientRate > 0 |

**Constraint:** burnRate + divideRate + liquidityRate + recipientRate must equal 100.

#### Launch Response

Success:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "txHash": "transaction hash or signature",
    "tokenAddress": "newly created token address",
    "success": true
  },
  "success": true
}
```

On-chain execution failed:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "txHash": "transaction hash or signature",
    "tokenAddress": null,
    "success": false
  },
  "success": true
}
```

#### Launch Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 8004 | wrong_parameter | Missing or invalid required fields |
| 8006 | insufficient_balance | Wallet balance below minimum |
| 8060 | api_key_invalid | Invalid API Key |
| 8062 | api_key_rate_limited | QPS limit exceeded |
| 8106 | open_api_launch_chain_not_supported | Chain not supported (only sol/bsc) |
| 8107 | open_api_launch_buy_amount_exceed | buyAmount exceeds max (SOL: 100, BSC: 20) |
| 8108 | open_api_launch_failed | Node service call failed |
| 9006 | wallet_not_exists | Wallet not found or not owned by current account |

#### Launch Notes

- Transaction confirmation timeout: SOL ~25s, BSC ~3-5s
- SOL uri must be an accessible JSON metadata URL (Metaplex Token Metadata standard)
- BSC image upload is handled by FourMeme platform internally
- SOL mint address is randomly generated by the server
- SOL platform fee (1%) is charged automatically when buyAmount > 0

## Execution Rules

1. **Confirm trade details before writing** -- Before any write operation (`/swap`, `/launch`, `/autoSell/*`), confirm with the user: chain, token address, amount/percentage, buy or sell, and which wallet. Prefer an inline summary; do not block the user with multiple back-and-forth prompts once details are clear.
   - **First-trade-of-session risk acknowledgement**: On the **first** write operation of a session, additionally remind the user of the key risks in one compact block — `API Key = wallet access`, `no read-only key exists`, `IP whitelist recommended` — and have them confirm once via `AskUserQuestion`. Subsequent writes in the same session skip this risk block and only confirm trade details for speed.
2. **Auto-query wallet** -- If the user does not provide a wallet address:
   a. If there is a remembered default wallet for that chain, use it directly and show its current balance via Wallet Info API before confirming.
   b. Otherwise, call List Wallets API. If only 1 wallet exists, auto-select it. If multiple, ask user to choose. If none, guide to create at https://www.xxyy.io/wallet/manager?chainId={chain}.
   c. Remember the selected wallet as default for that chain.
   d. If the user provides a wallet address, call Wallet Info API to verify it exists and show its balance before confirming the trade.
3. **Use Bash with curl** to call the API
4. **Poll trade result** -- After swap submission, query trade status up to 3 times with 5s intervals
5. **Show transaction link** -- Always display the block explorer URL with the txId
6. **Never retry** failed swap requests -- show the error to user instead
7. **Chain-wallet validation** -- walletAddress must match the selected chain. A Solana wallet cannot be used for BSC/ETH/Base trades and vice versa. If the user provides a mismatched wallet/chain combination, warn them and ask to correct before proceeding.
8. **Strict parameter validation** -- Before calling the API, validate EVERY field:
   - All required parameters must be present and have legal values
   - `chain` must be one of `sol`/`eth`/`bsc`/`base`
   - `isBuy` must be boolean `true` or `false`
   - `amount` for buy: must be > 0; for sell: must be 1-100
   - `tip` must be provided; SOL chain: 0.0001-0.1 (unit: SOL); EVM chains: 0.1-100 (unit: Gwei). **If tip is outside the recommended range, must warn the user about potentially high cost and require explicit confirmation before proceeding**
   - `model` if provided must be 1 or 2
   - `priorityFee` if provided only applies to Solana chain
   - **Do NOT send any field names outside the parameter tables above**
   - If any validation fails, refuse to send the request and ask the user to correct

## Feed Rules

1. **type validation** -- Only accept `NEW`, `ALMOST`, `COMPLETED` (uppercase). Reject any other value.
2. **chain validation** -- Feed only supports `sol` and `bsc`. If user specifies `eth` or `base`, reject and inform them that Feed scanning is only available on Solana and BSC chains.
3. **Single query mode (default)** -- Call the Feed API once, format and display key info for each token: symbol, priceUSD, marketCapUSD, holders, devHoldPercent, launchPlatform (name + progress).
4. **Continuous monitor mode** -- Activate only when user explicitly says "持续监控", "monitor", or "watch":
   - Use a Bash polling loop, calling Feed API every 5 seconds
   - Deduplicate by `tokenAddress` — only display newly appeared tokens
   - Loop limit: 480 seconds (8 minutes). Set Bash timeout to 540000ms
   - After loop ends, use AskUserQuestion to ask: continue monitoring / view token details / buy a token / stop
   - When continuing, preserve the seen `tokenAddress` set to avoid repeats
5. **Filter guidance** -- Before querying, optionally ask user about filter preferences (market cap range, liquidity, holder count, etc.). If not asked, use no filters (return all).
6. **No auto-trading** -- Feed scanning is for observation only. NEVER automatically buy or sell based on scan results.
7. **Error handling** -- See Error Codes table. For data query APIs: `code == 200` with `success == true` means success; `code == 300` is server error (inform user to retry later); `code == 8060/8061` means stop immediately; `code == 8062` means wait 2 seconds and retry.

## Token Query Rules

1. **ca required** -- Contract address (`ca`) must be provided. If missing, ask user for it.
2. **chain validation** -- Supports all 4 chains: `sol`, `eth`, `bsc`, `base`. Default `sol`.
3. **HoneyPot warning** -- If `securityInfo.honeyPot == true`, display a **prominent warning** that this token is a honeypot and trading it is extremely risky.
4. **High tax alert** -- If `taxInfo.buy` or `taxInfo.sell` > 5%, warn user about high tax rates.
5. **Display format** -- Present results in groups: Trade Info → Security Check → Tax Rates → Holder Distribution → Social Links.
6. **Trade follow-up** -- After displaying query results, optionally ask user if they want to buy this token, linking to the Buy Token flow.
7. **Error handling** -- Same as Feed Rules (see Error Codes table).

## Wallets Rules

1. **chain validation** -- Supports all 4 chains. Default `sol`.
2. **Display format** -- Show wallet name, address, native balance. Mark pinned wallets with ⭐.
3. **Token holdings** -- If user asks about specific token holdings, pass `tokenAddress` to show per-wallet balance.
4. **No wallets** -- If response returns empty list, guide user to create at: https://www.xxyy.io/wallet/manager?chainId={chain}
5. **Default wallet memory** -- After user selects a wallet, remember it as the default for that chain in the current session. Use this default for subsequent trades on the same chain without asking again.
6. **Single wallet query** -- When the user provides a specific wallet address and asks for its balance, use Wallet Info API instead of List Wallets. Also use Wallet Info to show balance before trade confirmation.
7. **Error handling** -- Same as other data query APIs (see Error Codes table).

### Auto-Sell Rules (止盈止损)

Manage take-profit and stop-loss rules. When auto-sell is enabled, buying a token automatically creates pending sell orders based on these rules.

#### List Rules
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/list`

No parameters. Returns all rules for current user.

**Response:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 123,
      "taskFlag": 0,
      "pricePercent": 30,
      "sellPercent": 100,
      "isTrailing": 1,
      "createTime": "2026-04-09T08:00:00.000+00:00"
    }
  ],
  "success": true
}
```

Fields:
- `taskFlag`: `0` = stop-loss (止损), `1` = take-profit (止盈)
- `pricePercent`: trigger percentage (e.g. 30 = price drops/rises 30% from buy price)
- `sellPercent`: percentage of holdings to sell (0-100)
- `isTrailing`: `1` = trailing stop enabled, `0` = disabled. Only effective for stop-loss rules (taskFlag=0). When enabled, the stop-loss price automatically trails upward as token price rises, locking in profits.

#### Create/Update Rules
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/createOrUpdate`

**⚠️ This is a full replacement** -- all existing rules are deleted and replaced with the provided list. Always include ALL desired rules (both new and existing) in the request.

```json
{
  "infos": [
    { "taskFlag": 1, "pricePercent": 100, "sellPercent": 50, "isTrailing": 0 },
    { "taskFlag": 0, "pricePercent": 30, "sellPercent": 100, "isTrailing": 1 }
  ]
}
```

**Behavior notes:**
1. When user wants to add a rule, first call List to get existing rules, then merge and send all together.
2. `isTrailing` is ignored for take-profit rules (taskFlag=1) and always stored as 0.

#### Delete Rules
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/delete?ids=123,456`

- `ids` (required): comma-separated rule IDs to delete. Only deletes rules owned by current user.

#### Toggle Auto-Sell
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/open`

| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| flag | yes | — | `true` to enable, `false` to disable auto-sell |
| tokenAddress | no | `""` | If set, only close pending orders for this token |
| closeAll | no | `false` | If `true`, close ALL pending auto-sell orders |

**Behavior notes:**
1. Toggling off does NOT delete rules, only disables auto-sell and optionally closes pending orders.
2. `closeAll=true` removes all pending limit orders generated by auto-sell rules.
3. `tokenAddress` and `closeAll` are only relevant when `flag=false`.

### Token Holder List

Query token holder information including top holders, followed wallets, KOL wallets, and insider wallets.

`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/{type}`

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| type | path | yes | Holder type: `top` (top 20 holders), `follow` (followed wallets), `kol` (KOL wallets), `insider` (insider wallets) |
| mint | query | no | Token contract address |
| pair | query | no | Pool/pair address |
| wallet | query | no | Wallet address to filter |
| chain | query | no | Blockchain, default `sol`. Supports `bsc`, `base`, etc. |

**Response fields (per holder):**
- `address` — Wallet address
- `name` — Wallet name (only for followed wallets, null otherwise)
- `holdAmount` — Token amount held
- `holdPercent` — Hold percentage (e.g. "39.16" = 39.16%)
- `holdValueNative` — Hold value in native token (SOL/BNB)
- `holdValueUSD` — Hold value in USD
- `tags` — Labels: `NEW`, `SNIPER`, `BUNDLE`, `INSIDER`, `LP`
- `tradeCount` / `buyCount` / `sellCount` — Trade statistics (nullable)
- `profitNative` / `profitUSD` / `profitPercent` — Profit data (nullable)
- `avgBuyPrice` / `avgSellPrice` — Average trade prices (nullable)
- `tokenSourceType` — Token source: `1` = bought, `2` = transferred
- `nativeBalance` — Native token balance of the wallet

**Behavior notes:**
1. At least one of `mint` or `pair` should be provided to get meaningful results.
2. The `follow` type returns holders from the user's followed wallet list — results depend on user's follow configuration.
3. Response data is nullable for many fields — holders who received tokens via transfer (tokenSourceType=2) typically have null trade/profit data.

## Onboarding Flow

**Trigger**: Automatically execute once when the skill is first activated in a session. Run only once per session.

### Detection Logic

1. Check if `$XXYY_API_KEY` is set in the environment.
2. **Case A — No API Key**: Display a setup guide:
   - How to get a key: visit https://www.xxyy.io/apikey
   - How to set it: `export XXYY_API_KEY=xxyy_ak_xxxx`
   - Show the feature table (Trade, Feed, Token Query, Wallets) and available strategies list.
   - Stop here until user sets the key.
3. **Case B — API Key exists**: Silently call Ping API.
   - **Ping success**: Silently fetch wallets for all 4 chains (`sol`, `eth`, `bsc`, `base`) via List Wallets API. For each chain, pick the index-0 wallet as the default; if no wallet exists, show "N/A". Display:
     - Feature table (Trade, Feed, Token Query, Wallets)
     - Default wallets table: Chain | Wallet Name | Address | Balance
     - Available strategies list (Strategy 1/2/3 with trigger phrases)
     - Tip: `修改默认钱包 {chain} {wallet name or address}` to change defaults
   - **Ping failure (8060/8061)**: **Case C** — inform user that the API Key is invalid or disabled, guide them to regenerate at https://www.xxyy.io/apikey.

### Change Default Wallet

When user says "修改默认钱包 {chain} {wallet name or address}":
- Match by wallet name (case-insensitive) or address against the List Wallets result for that chain.
- If matched, update the session default and confirm.
- If no match, show available wallets for that chain and ask user to pick.

### Non-blocking

If the user sends an action command (e.g., buy/sell/scan) before onboarding completes, silently finish the detection in the background and proceed to handle their command directly.

## Strategy Rules (Common)

These rules apply to all three strategies below.

1. **Wallet prerequisite** — If no default wallet is set for the required chain, run the Onboarding wallet-fetch step first.
2. **Confirmation table** — Before every trade, display a confirmation table with: chain, action (buy/sell), wallet (name + address + balance), token (symbol + address), amount, tip, slippage. Proceed only after explicit user confirmation.
3. **Result display** — After trade completes, show: txId, status, block explorer link (see Block Explorer URLs).
4. **Mutual exclusion** — Only one polling strategy (Strategy 2 or 3) can run at a time. Starting a new one stops the current one.
5. **Stop command** — User says "stop" or "停止" → immediately terminate the active polling strategy.
6. **No auto-trading** — Strategy 2 and 3 scanning only displays results. NEVER automatically submit a trade. User must explicitly choose to buy.
7. **Amount modification** — User says "修改金额 {value}" → update the buy amount for the next trade (does not affect in-flight trades).
8. **Default parameters** — SOL: slippage 20%, tip 0.0001 SOL. EVM chains (eth/bsc/base): slippage 20%, tip 1 Gwei. Users can override.
9. **Error handling** — 8060/8061: stop strategy immediately. 8062: wait 2s and retry. 300: notify user of server error.
10. **Parameter validation** — All trades follow Execution Rules #8 (strict parameter validation).

## Strategy 1: Direct Buy/Sell

**Trigger**: User provides a token contract address with buy/sell intent (e.g., "买 0x... 0.1 BNB", "sell 50% of ...").

### Flow

1. **Parse intent**: Identify action (buy/sell), token address, chain, amount, wallet.
2. **Chain auto-detect**: `0x` prefix → EVM chain. If the specific EVM chain (eth/bsc/base) cannot be determined, ask user. Base58 format → SOL.
3. **Wallet selection**: Follow Execution Rules #2 (auto-query wallet logic).
4. **Display confirmation table** (see Strategy Rules #2).
5. **User confirms** → Call Swap API → Poll trade status (Execution Rules #4) → Display result (Strategy Rules #3).
6. **On failure**: Do NOT retry. Show error to user (Execution Rules #6).

## Strategy 2: AI Auto Scan

**Trigger**: User says "AI扫链", "AI scan", "auto scan", "smart scan", or "开始AI扫链".

### Setup

1. Confirm default wallets exist for SOL and BSC (required chains for Feed). If missing, fetch via Onboarding.
2. Confirm buy amount per chain. Defaults: 0.1 SOL / 0.001 BNB. User can customize.
3. Display configuration summary: wallets, amounts, scan tiers.

### Scan Tiers

Three tiers run in parallel each polling round. These are pre-validated filter parameters; users can modify them.

**Tier A — NEW** (freshly launched tokens):
```json
{"topHp":"22,40","snipers":",6","insiderHp":",8","holder":"10,","mc":"8000,","oneLink":1,"createTime":"1,70"}
```
Feed type: `NEW`

**Tier B — ALMOST** (near graduation):
```json
{"createTime":"1,120","dexPay":1,"mc":"13000,"}
```
Feed type: `ALMOST`

**Tier C — COMPLETED** (graduated tokens):
```json
{"createTime":"1,240","topHp":"18,","holder":"300,","mc":"20000,160000"}
```
Feed type: `COMPLETED`

### Polling Logic

- **Interval**: Every 5 minutes per round.
- **Requests per round**: 3 tiers × 2 chains (sol + bsc) = up to 6 Feed API calls.
- **Max duration**: 60 minutes. After 60 minutes, ask user whether to continue.
- **Deduplication**: Track `tokenAddress` across all rounds and chains. Only display newly discovered tokens.

### Display Format

For each new token found, show:
| Field | Source |
|-------|--------|
| Symbol | `symbol` |
| Chain | request chain |
| Price | `priceUSD` |
| Market Cap | `marketCapUSD` |
| Holders | `holders` |
| Dev Hold % | `devHoldPercent` |
| Platform + Progress | `launchPlatform.name` + `launchPlatform.progress` |
| Matched Tier | A / B / C |

### User Interaction

After displaying new tokens, user can:
- **Select a token** → Call Token Query API to show full details (security, tax, links, holders).
- **Buy a token** → Switch to Strategy 1 flow with the selected token.
- **Skip / continue** → Wait for next polling round.

## Strategy 3: Tweet Scan

**Trigger**: User says "推文扫链", "tweet scan", "twitter scan", or "开始推文扫链".

### Default Monitored Accounts

`@heyibinance`, `@cz_binance` — recommended defaults. User can modify before or during scanning.

### Setup

1. Confirm monitored Twitter account list.
2. Confirm BSC wallet exists (Tweet Scan is BSC-only). If missing, fetch via Onboarding.
3. Confirm buy amount. Default: 0.001 BNB.
4. Display configuration summary: accounts, wallet, amount.
5. **Fixed parameters** (not user-modifiable): tip = 5 Gwei, slippage = 50%, model = 1.

### Polling Flow

Every 5 seconds:

1. Call `POST /feed/NEW?chain=bsc` with body `{"oneLink":1}` to get new BSC tokens with social links.
2. Deduplicate by `tokenAddress` using `seen_token_addresses` set.
3. For each new token where `hasLink == true`:
   a. Call `GET /query?ca={tokenAddress}&chain=bsc` to fetch full token details including `linkInfo`.
   b. Check if `linkInfo.x` contains any monitored account handle (case-insensitive substring match).
   c. Also deduplicate by `linkInfo.x` URL using `seen_twitter_urls` set.
4. **Match found** → Display token details + confirmation table. Wait for user response (buy / skip).
5. **No match** → Skip silently, continue polling.

### Duration

- **Max duration**: 30 minutes. After 30 minutes, ask user whether to continue.
- Use a Bash polling loop. Set Bash timeout to 1860000ms (31 minutes).

### Account Management

- "修改账号 @xxx" → Replace the entire monitored list with the new account. Takes effect next polling round.
- "添加账号 @xxx" → Append to the monitored list. Takes effect next polling round.

### Status Line

Display a status line during scanning:
```
[HH:MM:SS] Scanning BSC... (watching: @heyibinance, @cz_binance) #N
```
Where `#N` is the count of tokens scanned so far.

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

| Code | Meaning | Scope |
|------|---------|-------|
| 200 | Success | Data query APIs (Feed, Token Query) |
| 300 | Server error — inform user to retry later | Data query APIs (Feed, Token Query) |
| 8060 | API Key invalid | All APIs |
| 8061 | API Key disabled | All APIs |
| 8062 | Rate limited | All APIs — data query: retry after 2s; trade: retry after 1s (except swap, see Execution Rules #5) |
| 8063 | IP not in whitelist — use `get_ip` to check current IP, update whitelist at https://www.xxyy.io/apikey | All APIs |

## Example curl

```bash
# Buy
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/swap" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain":"sol","walletAddress":"...","tokenAddress":"...","isBuy":true,"amount":0.1,"tip":0.0001}'

# Query Trade
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trade?txId=..." \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Feed - Scan newly launched tokens on SOL (with filters)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/feed/NEW?chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mc":"10000,500000","holder":"50,","insiderHp":",50"}'

# Token Query
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/query?ca=TOKEN_ADDRESS&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# List Wallets
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallets?chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Wallet Info
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallet/info?walletAddress=YOUR_WALLET&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# PNL Query
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/pnl?walletAddress=YOUR_WALLET&tokenAddress=TOKEN_ADDRESS&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Trade History
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trades?walletAddress=YOUR_WALLET&chain=sol&pageNum=1&pageSize=10" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Get IP (exempt from IP whitelist)
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/ip" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# KOL Buy List
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/kol-buy-list?chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Tag Holder Buy List
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/tag-holder-buy-list?chain=bsc" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Label List (SOL only)
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/label-list?chain=sol&labelType=AGENT_KOL" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Signal List (SOL/BSC)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/signal-list?type=open-ai-trending&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'

# Trending List (SOL/BSC)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trending-list?chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"period": "5M"}'

# Launch Token - SOL (create only)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/sol/launch" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"<SOL_WALLET>","name":"My Token","symbol":"MTK","buyAmount":"0","solOptions":{"uri":"https://arweave.net/<metadata_id>","slippage":10000,"priorityFee":100000,"tipFee":100000,"model":1}}'

# Launch Token - SOL (create + buy 0.5 SOL)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/sol/launch" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"<SOL_WALLET>","name":"My Token","symbol":"MTK","buyAmount":"0.5","solOptions":{"uri":"https://arweave.net/<metadata_id>","slippage":10000,"priorityFee":100000,"tipFee":100000,"model":1,"cashback":true}}'

# Launch Token - BSC (create + buy 0.001 BNB)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/bsc/launch" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"<BSC_WALLET>","name":"Exchange the world","symbol":"ETW","buyAmount":"0.001","bscOptions":{"desc":"Exchange the world","image":"https://example.com/image.png","label":"Meme","gasPrice":"3000000000","model":1,"feePlan":false}}'

# Launch Token - BSC (with token tax)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/bsc/launch" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"<BSC_WALLET>","name":"Tax Token","symbol":"TAXT","buyAmount":"0.1","bscOptions":{"desc":"A token with tax","image":"https://example.com/image.png","label":"Defi","model":1,"tokenTaxInfo":{"feeRate":5,"burnRate":20,"divideRate":30,"liquidityRate":0,"recipientRate":50,"minSharing":100000,"recipientAddress":"0x..."}}}'

# Auto-Sell: List rules
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/list" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Auto-Sell: Create rules (full replacement - include ALL desired rules)
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/createOrUpdate" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"infos":[{"taskFlag":1,"pricePercent":100,"sellPercent":50,"isTrailing":0},{"taskFlag":0,"pricePercent":30,"sellPercent":100,"isTrailing":1}]}'

# Auto-Sell: Delete rules by ID
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/delete?ids=123,456" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Auto-Sell: Enable
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/open?flag=true" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Auto-Sell: Disable and close all pending orders
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/open?flag=false&closeAll=true" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Holders: Top holders (SOL)
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/top?mint=<TOKEN_ADDRESS>&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Holders: KOL holders (BSC, with pair)
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/kol?mint=<TOKEN_ADDRESS>&pair=<PAIR_ADDRESS>&chain=bsc" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Holders: Followed wallets
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/follow?mint=<TOKEN_ADDRESS>&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"

# Holders: Insider wallets
curl -s "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/insider?mint=<TOKEN_ADDRESS>&chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY"
```
