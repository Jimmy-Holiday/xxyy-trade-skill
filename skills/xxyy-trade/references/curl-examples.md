# XXYY Trade — curl Examples

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
