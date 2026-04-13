# XXYY Trade — Scanning Strategies

> Detailed specifications for AI Auto Scan and Tweet Scan. For common strategy rules and Strategy 1 (Direct Buy/Sell), see the main [SKILL.md](../SKILL.md).

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
