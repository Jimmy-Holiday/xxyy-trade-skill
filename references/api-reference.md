# XXYY Trade — Full API Reference

> This is the complete API reference. For the most common endpoints (Buy, Sell, Query Trade, Ping, Feed), see the main [SKILL.md](../SKILL.md).

## Token Query
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/query?ca={contract_address}&chain={chain}`

Query token details: price, security checks, tax rates, holder distribution, etc.

### Token Query Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `ca` | YES | string | Contract address | Token contract address |
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol`. All 4 chains supported |

### Token Query Response

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

## List Wallets
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallets`

Query the current user's wallet list (with balances) for a specific chain.

### Wallets Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol` |
| `pageNum` | NO | int | >= 1 | Page number, default 1 |
| `pageSize` | NO | int | 1-20 | Items per page, default 20 |
| `tokenAddress` | NO | string | Contract address | Returns token holdings per wallet |

### Wallets Response

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

### Chain Codes

| Code | Chain |
|------|-------|
| 1 | SOL |
| 2 | BSC |
| 3 | ETH |
| 6 | BASE |

## Wallet Info
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallet/info`

Query a single wallet's details (native balance + optional token balance).

### Wallet Info Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | EVM chains are case-insensitive |
| `chain` | NO | string | `sol` / `eth` / `bsc` / `base` | Default `sol` |
| `tokenAddress` | NO | string | Contract address | Returns token holdings for this token |

### Wallet Info Response

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

## PNL Query
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/pnl?walletAddress=<wallet>&tokenAddress=<token>&chain=<chain>`

Query PNL (profit and loss) data for a specific wallet-token pair. Returns buy/sell totals, current holdings, and profit in both native currency and USD. Covers the last 30 days.

### PNL Query Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | Must belong to current API Key user |
| `tokenAddress` | YES | string | Contract address | Token contract address |
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Chain identifier (required) |

### PNL Query Response

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

## Trade History
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trades?walletAddress=<wallet>&chain=<chain>`

Paginated query of successful trade records for a specific wallet. Only returns completed transactions, sorted by creation time (newest first).

### Trade History Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `walletAddress` | YES | string | Wallet address | Must belong to current API Key user |
| `chain` | YES | string | `sol` / `eth` / `bsc` / `base` | Chain identifier (required) |
| `tokenAddress` | NO | string | Contract address | Filter by specific token |
| `pageNum` | NO | int | >= 1 | Page number, default 1 |
| `pageSize` | NO | int | 1-20 | Items per page, default 20 |

### Trade History Response

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

## Get IP
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/ip`

Get the current outbound IP address of this server. Use this to check which IP to add to your API Key's whitelist. **This endpoint is exempt from IP whitelist restrictions** — it will work even if your IP is not whitelisted.

No parameters required.

### Get IP Response

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

## KOL Buy List / Tag Holder Buy List

These two endpoints share an identical response structure. The only differences are the endpoint URL and the type of wallets tracked (KOL wallets vs tagged wallets such as Smart Money, Whale, etc.).

### KOL Buy List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/kol-buy-list?chain={chain}`

Get KOL (Key Opinion Leader) recent buy list. Shows tokens recently purchased by influential traders.

### Tag Holder Buy List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/tag-holder-buy-list?chain={chain}`

Get tag holder (Smart Money, Whale, etc.) recent buy list. Shows tokens recently purchased by tagged wallets.

### Parameters (both endpoints)

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Only SOL and BSC supported |

### Response (both endpoints)

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
          "wallet": "WalletAddress...",
          "walletName": "Wallet Name / Tag",
          "walletBuyAmount": 1.5
        }
      ]
    }
  ]
}
```

### Response fields (both endpoints)

- **tokenMeta.symbol**: Token symbol
- **tokenMeta.mint**: Token contract address
- **tokenMeta.dexId**: DEX identifier
- **tokenMeta.pairAddress**: Trading pair address
- **tokenMeta.imageUrl**: Token logo URL
- **priceNative**: Price in native currency
- **priceUsd**: Price in USD
- **marketCap**: Market capitalization in USD
- **priceChange24h**: 24-hour price change percentage
- **walletBuyCnt**: Number of wallets that bought (KOL wallets for kol-buy-list, tagged wallets for tag-holder-buy-list)
- **lastTradeTime**: Last trade timestamp (milliseconds)
- **holder**: Number of holders
- **walletBuyItemList[].wallet**: Wallet address
- **walletBuyItemList[].walletName**: Wallet name (KOL name for kol-buy-list, tag name e.g. "Smart Money" for tag-holder-buy-list)
- **walletBuyItemList[].walletBuyAmount**: Buy amount in native currency

## Label List
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/label-list?chain={chain}&labelType={labelType}`

Get tokens with specific labels (e.g., AGENT_KOL marked tokens). Currently only supports Solana chain.

### Label List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Supports SOL and BSC |
| `labelType` | NO | string | `AGENT_KOL` | Default `AGENT_KOL`. Currently only AGENT_KOL supported |

### Label List Response

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

## Signal List
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/signal-list?type={type}&chain={chain}`

Get AI trend signal list (e.g., open-ai-trending tokens). Supports SOL and BSC chains.

### Signal List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `type` | NO | string | `open-ai-trending` | Default `open-ai-trending`. Currently only open-ai-trending supported |
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Supports SOL and BSC |

Request body: Empty JSON object `{}`

### Signal List Response

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

## Trending List
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trending-list?chain={chain}`

Get trending/hot token list. Shows the most active tokens within a given time period. Supports SOL and BSC chains.

### Trending List Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | NO | string | `sol` / `bsc` | Default `sol`. Only SOL and BSC supported |
| `period` | YES | string | `1M` / `5M` / `30M` / `1H` / `6H` / `24H` | Time period for trending. Not all periods available for all internal categories |

Request body:
```json
{ "period": "5M" }
```

### Trending List Response

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

## Launch Token
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/{chain}/launch`

Launch (create) a new token on SOL or BSC chain. Optionally buy an initial amount of the newly created token.

### Path Parameters

| Param | Required | Type | Valid values | Description |
|-------|----------|------|-------------|-------------|
| `chain` | YES | string | `sol` / `bsc` | Only SOL and BSC supported |

### Launch Request Body

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

### solOptions (chain=sol)

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

### bscOptions (chain=bsc)

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

### tokenTaxInfo (BSC only)

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

### Launch Response

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

### Launch Error Codes

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

### Launch Notes

- Transaction confirmation timeout: SOL ~25s, BSC ~3-5s
- SOL uri must be an accessible JSON metadata URL (Metaplex Token Metadata standard)
- BSC image upload is handled by FourMeme platform internally
- SOL mint address is randomly generated by the server
- SOL platform fee (1%) is charged automatically when buyAmount > 0

## Auto-Sell Rules

Manage take-profit and stop-loss rules. When auto-sell is enabled, buying a token automatically creates pending sell orders based on these rules.

### List Rules
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

### Create/Update Rules
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/createOrUpdate`

**This is a full replacement** -- all existing rules are deleted and replaced with the provided list. Always include ALL desired rules (both new and existing) in the request.

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

### Delete Rules
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/autoSell/delete?ids=123,456`

- `ids` (required): comma-separated rule IDs to delete. Only deletes rules owned by current user.

### Toggle Auto-Sell
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

## Token Holder List

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
