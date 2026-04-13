---
name: xxyy-trade
description: "Buy, sell, and swap tokens on Solana/ETH/BSC/Base chains; scan tokens for safety and new launches; monitor chain activity with AI-powered scanning; manage wallets and balances; set stop-loss and take-profit auto-sell rules; launch new tokens; and query holder, KOL, and trending data through the XXYY Open API. Use when the user asks to buy token, sell token, swap token, trade crypto, check trade status, query transaction, scan tokens, feed, monitor chain, query token, token details, check token safety, list wallets, show wallets, my wallets, AI scan, auto scan, smart scan, tweet scan, twitter scan, onboarding, get started, check IP, get IP, IP whitelist, launch token, create token, auto sell, stop loss, take profit, trailing stop, holders, top holders, kol holders, insider, or mentions trading on Solana/ETH/BSC/Base chains via XXYY."
version: 1.5.0
disabled-model-invocation: true
allowed-tools: Bash, Read, AskUserQuestion
---

# XXYY Trade

On-chain token trading and data queries on Solana, Ethereum, BSC, and Base via XXYY Open API.

## Prerequisites

Set environment variables before use:
- `XXYY_API_KEY` (required) -- Your XXYY Open API Key (format: `xxyy_ak_xxxx`). Get one at https://www.xxyy.io/apikey
- `XXYY_API_BASE_URL` (optional) -- API base URL, defaults to `https://www.xxyy.io`

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
Query token details: price, security checks, tax rates, holder distribution, etc.
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/query?ca={contract_address}&chain={chain}`
See [references/api-reference.md](references/api-reference.md#token-query) for full parameters and response schema.

### List Wallets
Query the current user's wallet list (with balances) for a specific chain.
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallets`
See [references/api-reference.md](references/api-reference.md#list-wallets) for full parameters and response schema.

### Wallet Info
Query a single wallet's details (native balance + optional token balance).
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/wallet/info`
See [references/api-reference.md](references/api-reference.md#wallet-info) for full parameters and response schema.

### PNL Query
Query PNL (profit and loss) data for a specific wallet-token pair. Returns buy/sell totals, current holdings, and profit in both native currency and USD.
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/pnl?walletAddress=<wallet>&tokenAddress=<token>&chain=<chain>`
See [references/api-reference.md](references/api-reference.md#pnl-query) for full parameters and response schema.

### Trade History
Paginated query of successful trade records for a specific wallet, sorted by creation time (newest first).
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trades?walletAddress=<wallet>&chain=<chain>`
See [references/api-reference.md](references/api-reference.md#trade-history) for full parameters and response schema.

### Get IP
Get the current outbound IP address. Use to check which IP to add to your API Key's whitelist. **Exempt from IP whitelist restrictions.**
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/ip`
See [references/api-reference.md](references/api-reference.md#get-ip) for response schema.

### KOL Buy List / Tag Holder Buy List
Get tokens recently purchased by KOLs or tagged wallets (Smart Money, Whale, etc.). Both endpoints share the same response structure.
- KOL: `GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/kol-buy-list?chain={chain}`
- Tag Holder: `GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/tag-holder-buy-list?chain={chain}`
See [references/api-reference.md](references/api-reference.md#kol-buy-list--tag-holder-buy-list) for full parameters and response schema.

### Label List
Get tokens with specific labels (e.g., AGENT_KOL marked tokens). Supports SOL and BSC chains.
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/label-list?chain={chain}&labelType={labelType}`
See [references/api-reference.md](references/api-reference.md#label-list) for full parameters and response schema.

### Signal List
Get AI trend signal list (e.g., open-ai-trending tokens). Supports SOL and BSC chains.
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/signal-list?type={type}&chain={chain}`
See [references/api-reference.md](references/api-reference.md#signal-list) for full parameters and response schema.

### Trending List
Get trending/hot token list by time period. Supports SOL and BSC chains.
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/trending-list?chain={chain}`
See [references/api-reference.md](references/api-reference.md#trending-list) for full parameters and response schema.

### Launch Token
Launch (create) a new token on SOL or BSC chain. Optionally buy an initial amount.
`POST ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/{chain}/launch`
See [references/api-reference.md](references/api-reference.md#launch-token) for full parameters (solOptions, bscOptions, tokenTaxInfo), error codes, and notes.

### Auto-Sell Rules
Manage take-profit and stop-loss rules. See [references/api-reference.md](references/api-reference.md#auto-sell-rules) for endpoint details.

Key behavior:
- Create/Update is a **full replacement** — always include ALL desired rules
- When adding a rule, first call List to get existing rules, then merge and send all together
- Toggling off does NOT delete rules, only disables auto-sell

### Token Holder List
Query token holder information including top holders, followed wallets, KOL wallets, and insider wallets.
`GET ${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/holders/{type}`
See [references/api-reference.md](references/api-reference.md#token-holder-list) for full parameters, holder types, response fields, and behavior notes.

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

Runs parallel Feed scans across three tiers (NEW, ALMOST, COMPLETED) on SOL and BSC chains every 5 minutes, deduplicating by tokenAddress. Max duration 60 minutes.

See [references/strategies.md](references/strategies.md#strategy-2-ai-auto-scan) for full setup, scan tier filters, polling logic, and display format.

## Strategy 3: Tweet Scan

**Trigger**: User says "推文扫链", "tweet scan", "twitter scan", or "开始推文扫链".

Monitors BSC new tokens for Twitter links matching watched accounts (default: @heyibinance, @cz_binance). Polls every 5 seconds, max 30 minutes.

See [references/strategies.md](references/strategies.md#strategy-3-tweet-scan) for full setup, polling flow, account management, and status line format.

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

## Example curl Commands

For a complete set of curl examples for every endpoint, see [references/curl-examples.md](references/curl-examples.md).

Key examples:

```bash
# Buy
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/swap" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain":"sol","walletAddress":"...","tokenAddress":"...","isBuy":true,"amount":0.1,"tip":0.0001}'

# Sell
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/swap" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"chain":"sol","walletAddress":"...","tokenAddress":"...","isBuy":false,"amount":50,"tip":0.0001}'

# Feed - Scan newly launched tokens on SOL
curl -s -X POST "${XXYY_API_BASE_URL:-https://www.xxyy.io}/api/trade/open/api/feed/NEW?chain=sol" \
  -H "Authorization: Bearer $XXYY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mc":"10000,500000","holder":"50,","insiderHp":",50"}'
```
