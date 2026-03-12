# XXYY Trade Skill

[English](../README.md) | **中文**

通过 [XXYY](https://www.xxyy.io) Open API 在 **Solana**、**Ethereum**、**BSC** 和 **Base** 链上进行代币交易 — 使用自然语言。

支持 **Claude Code Skill**、**OpenClaw** 和 **MCP Server**（适用于 Claude Desktop、Cursor、Windsurf、Cline 等）。

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

在 OpenClaw 对话中粘贴仓库 URL：

```
https://github.com/Jimmy-Holiday/xxyy-trade-skill
```

或通过 ClawHub CLI：

```bash
clawhub install xxyy-trade
```

## 配置

使用前需要导出你的 XXYY API Key：

```bash
export XXYY_API_KEY=xxyy_ak_your_key_here
```

在 [xxyy.io](https://www.xxyy.io) 获取 API Key：注册并登录，点击顶部工具栏的九宫格图标进入 API Key 管理页面，然后生成新的 API Key。

可选设置自定义 Base URL：

```bash
export XXYY_API_BASE_URL=https://www.xxyy.io
```

## 使用方式

安装完成后，直接用自然语言告诉 Claude 你想做什么：

- `"用 0.1 SOL 买 <代币地址>"`
- `"在 BSC 上卖出 <代币地址> 的 50%"`
- `"查一下交易状态 <txId>"`
- `"ping 一下 xxyy api"`
- `"扫一下 Solana 上的新代币"`
- `"BSC 上市值大于 5 万的已毕业代币"`
- `"查一下 0x1234... 的代币详情"`
- `"监控 SOL 上的新代币，最少 50 个持有人"`

Skill 会在执行交易前与你确认交易细节。

## 支持的链

| 链 | 原生代币 |
|----|---------|
| Solana (`sol`) | SOL |
| Ethereum (`eth`) | ETH |
| BSC (`bsc`) | BNB |
| Base (`base`) | ETH |

## 许可证

[MIT](../LICENSE)
