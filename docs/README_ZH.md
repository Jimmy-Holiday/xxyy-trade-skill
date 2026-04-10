# XXYY Trade Skill

[English](../README.md) | **中文**

通过 [XXYY](https://www.xxyy.io) Open API 在 **Solana**、**Ethereum**、**BSC** 和 **Base** 链上进行代币交易 — 使用自然语言。

[XXYY](https://www.xxyy.io) 是一款上线约一年半的 memecoin 交易工具，主打 **交易速度快**、**功能齐全**、**返佣与返现比例高**。使用 XXYY API 可同时享受 **手续费优惠** 与 **邀请返佣**，实际费率最低约 **0.4%**。

![链](https://img.shields.io/badge/链-SOL%20|%20ETH%20|%20BSC%20|%20Base-blue)
![手续费](https://img.shields.io/badge/手续费-最低约%200.4%25-brightgreen)
![返佣](https://img.shields.io/badge/返佣-已启用-orange)
![版本](https://img.shields.io/badge/版本-1.5.1-informational)
![许可证](https://img.shields.io/badge/许可证-MIT-lightgrey)

支持 **Claude Code Skill**、**OpenClaw** 和 **MCP Server**（适用于 Claude Desktop、Cursor、Windsurf、Cline 等）。

> [!CAUTION]
> **你的 API Key = 你的钱包。** XXYY API Key 可以直接使用你的钱包余额执行真实链上交易。一旦泄漏，任何人都可以用你的资金买卖代币。**绝不要分享、绝不要提交到 git、绝不要粘贴到公开渠道。** 如果怀疑泄漏，请立即在 [xxyy.io](https://www.xxyy.io) 重新生成 Key。

## 功能说明

| 页面 | 说明 |
|------|------|
| **概览与鉴权** | 支持链、白名单策略、错误码 |
| **交易接口** | 一键买入卖出、多钱包切换、滑点与小费控制、结果返回 |
| **扫链发现** | 新开盘、即将打满、已发射三类代币实时流 |
| **代币查询** | 价格、市值、安全风险、税率、锁仓、社媒信息、Top10 持仓等 |
| **热门与信号** | 热门趋势榜单、AI 信号推荐、KOL / 关注钱包买入追踪 |
| **钱包接口** | 自查钱包列表、余额、盈亏统计、交易历史 |
| **自动止盈止损** | 自定义止盈止损比例，自动生成挂单，附带移动止损策略 |
| **一键发币** | Solana 和 BSC 链上创建新代币 |
| **运维健康** | 接口连通性检测、出网地址查询 |

## 安装

### MCP Server（Claude Desktop / Cursor / Windsurf / Cline / ...）

兼容所有 MCP 客户端。完整配置指南请参阅 **[mcp/docs/README_ZH.md](../mcp/docs/README_ZH.md)**。

```bash
# 1. 克隆并构建
git clone https://github.com/Jimmy-Holiday/xxyy-trade-skill.git
cd xxyy-trade-skill/mcp
npm install && npm run build

# 2. 添加到 Claude Code（示例）
claude mcp add xxyy-trade \
  -e XXYY_API_KEY=xxyy_ak_your_key_here \
  -- node /path/to/xxyy-trade-skill/mcp/dist/index.js
```

其他客户端（Claude Desktop、Cursor、Windsurf、Cline、Continue.dev、Zed、Cherry Studio）请在对应的 JSON/YAML 配置中添加：

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

> 各客户端详细配置示例：[mcp/docs/README_ZH.md](../mcp/docs/README_ZH.md)

### Claude Code Skill

**第 1 步** — 添加市场源：

```bash
/plugin marketplace add Jimmy-Holiday/xxyy-trade-skill
```

**第 2 步** — 安装插件：

打开 `/plugin` → 切换到 **Marketplaces** 标签页 → 选择 **xxyy-trade-skill** → **Browse plugins** → 安装 **xxyy-trade**。

> **排查提示：** 如果第 1 步成功后在 Marketplaces 标签页中看不到市场，请退出 `/plugin` 界面后重新打开。

或手动安装：将 `skills/xxyy-trade/` 复制到你项目的 `.claude/skills/` 目录。

### OpenClaw

在 OpenClaw 对话中粘贴 Skill 链接：

```
https://clawhub.ai/Jimmy-Holiday/xxyy-trade-skill
```

或通过 ClawHub CLI：

```bash
clawhub install xxyy-trade-skill
```

## 配置

使用前需要导出你的 XXYY API Key：

```bash
export XXYY_API_KEY=xxyy_ak_your_key_here
```

在 [xxyy.io/apikey](https://www.xxyy.io/apikey) 获取 API Key — 注册登录后直接生成。

可选设置自定义 Base URL：

```bash
export XXYY_API_BASE_URL=https://www.xxyy.io
```

## 使用方式

安装完成后，直接用自然语言告诉 Claude 你想做什么：

- `"看看我 SOL 上的钱包"`
- `"查一下 <钱包地址> 的余额"`
- `"用 0.1 SOL 买 <代币地址>"`
- `"在 BSC 上卖出 <代币地址> 的 50%"`
- `"查一下交易状态 <txId>"`
- `"ping 一下 xxyy api"`
- `"扫一下 Solana 上的新代币"`
- `"BSC 上市值大于 5 万的已毕业代币"`
- `"查一下 0x1234... 的代币详情"`
- `"监控 SOL 上的新代币，最少 50 个持有人"`
- `"看看 SOL 上 KOL 买入列表"`
- `"查询 BSC 上标签持有者买入列表"`
- `"显示 AGENT_KOL 标签列表"` (仅支持 SOL)
- `"获取 AI 趋势信号"` (支持 SOL/BSC)
- `"看看 SOL 上的热门代币"` (支持 SOL/BSC)
- `"在 SOL 上发一个新代币"` (支持 SOL/BSC)

Skill 会自动选择钱包，并在执行交易前与你确认交易细节。

> 配置指南与使用经验：[配置指南](https://x.com/PepeBoost888/status/2032052111010382031)

## 支持的链

| 链 | 原生代币 |
|----|---------|
| Solana (`sol`) | SOL |
| Ethereum (`eth`) | ETH |
| BSC (`bsc`) | BNB |
| Base (`base`) | ETH |

## 相关链接

- **官方推特**：[@useXXYYio](https://x.com/useXXYYio)
- **Co-founder 推特**：[@PepeBoost888](https://x.com/PepeBoost888)
- **龙虾讨论群（Telegram）**：[XXYYCLAW](https://t.me/XXYYCLAW)
- **官网**：[xxyy.io](https://www.xxyy.io)

## 许可证

[MIT](../LICENSE)
