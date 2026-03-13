# XXYY Trade MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Jimmy-Holiday/xxyy-trade-skill/blob/main/LICENSE)

通过 [XXYY](https://xxyy.io) Open API 进行链上代币交易和数据查询的 MCP Server。

支持 **Solana**、**Ethereum**、**BSC** 和 **Base** 链。

[English](../README.md) | **中文**

> [!CAUTION]
> **你的 API Key = 你的钱包。** XXYY API Key 可以直接使用你的钱包余额执行真实链上交易。一旦泄漏，任何人都可以用你的资金买卖代币。**绝不要分享、绝不要提交到 git、绝不要粘贴到公开渠道。** 如果怀疑泄漏，请立即在 [xxyy.io](https://xxyy.io) 重新生成 Key。

## 工具列表

| 工具 | 说明 |
|------|------|
| `buy_token` | 使用原生代币（SOL/ETH/BNB）买入代币 |
| `sell_token` | 按百分比（1-100%）卖出代币 |
| `query_trade` | 通过 txId 查询交易状态 |
| `ping` | 验证 API Key 是否有效 |
| `feed_scan` | 扫描 Meme 代币列表（仅 SOL/BSC） |
| `token_query` | 查询代币详情、安全检查、税率 |

## 前置条件

- **Node.js >= 18** — 下载地址：[https://nodejs.org](https://nodejs.org)（推荐 LTS 版本）。验证：`node -v`
- **XXYY API Key** — 在 [xxyy.io/apikey](https://www.xxyy.io/apikey) 获取

## 快速安装

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

> 将 `/path/to/xxyy-trade-skill` 替换为你的本地实际路径，`<your-key>` 替换为你的 API Key。

### Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）或 `%APPDATA%\Claude\claude_desktop_config.json`（Windows）：

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

编辑项目根目录的 `.cursor/mcp.json`：

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

编辑 `~/.codeium/windsurf/mcp_config.json`：

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

VS Code 侧边栏 > Cline > MCP Servers > Configure，编辑 `cline_mcp_settings.json`：

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

编辑 `~/.continue/config.yaml`：

```yaml
mcpServers:
  - name: xxyy-trade
    command: node
    args:
      - /path/to/xxyy-trade-skill/mcp/dist/index.js
    env:
      XXYY_API_KEY: <your-key>
```

### Zed 编辑器

编辑 `~/.config/zed/settings.json`：

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

### 任意 stdio MCP 客户端

```bash
XXYY_API_KEY=<your-key> node /path/to/xxyy-trade-skill/mcp/dist/index.js
```

---

## 能做什么？

连接后，直接用自然语言告诉 AI 助手：

| 你说 | 它做 |
|------|------|
| "用 0.1 SOL 买 `<代币地址>`" | 执行买入 |
| "在 BSC 上卖出 `<代币地址>` 的 50%" | 执行卖出 |
| "查一下交易状态 `<txId>`" | 查询交易结果 |
| "扫一下 Solana 上的新币" | Feed 扫描新上线代币 |
| "BSC 上市值大于 5 万的已毕业代币" | 带筛选的 Feed 扫描 |
| "查一下这个代币 `<合约地址>` 的详情" | 安全检查 + 代币信息 |
| "Ping 一下 XXYY API" | 验证连通性 |

## 兼容性

| 客户端 | 安装方式 | 状态 |
|--------|---------|------|
| **Claude Code** | `claude mcp add` | 一行命令 |
| Claude Desktop | JSON 配置 | 支持 |
| Cursor | JSON 配置 | 支持 |
| Windsurf | JSON 配置 | 支持 |
| Cline | JSON 配置 | 支持 |
| Continue.dev | YAML 配置 | 支持 |
| Zed | JSON 配置 | 支持 |
| Cherry Studio | GUI 配置 | 支持 |

## 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `XXYY_API_KEY` | 是 | XXYY Open API Key（`xxyy_ak_xxxx`） |
| `XXYY_API_BASE_URL` | 否 | API 基础 URL，默认 `https://www.xxyy.io` |

## 验证

配置完成后，重启 AI 客户端，使用 `ping` 工具验证：

```
> ping
pong — API Key is valid.
```

## 安全说明

- **API Key = 钱包权限** — 你的 XXYY API Key 可以直接使用你的钱包余额执行真实链上交易。一旦泄漏，任何人都可以用你的资金买卖代币。绝不要分享、绝不要提交到版本控制、绝不要粘贴到公开渠道。如果怀疑泄漏，请立即在 https://xxyy.io 重新生成 Key。
- **托管交易模式** — XXYY 使用你钱包余额执行交易，无需私钥或钱包签名。
- **无只读模式** — 同一个 Key 同时用于数据查询和交易。
- **不会自动轮询状态** — `buy_token` / `sell_token` 提交订单后只返回交易 ID，不会自动查询结果。需手动调用 `query_trade` 查看状态。

## 支持的链

| 链 | 原生代币 | 交易 | Feed 扫描 |
|----|---------|------|----------|
| Solana (`sol`) | SOL | 支持 | 支持 |
| Ethereum (`eth`) | ETH | 支持 | 不支持 |
| BSC (`bsc`) | BNB | 支持 | 支持 |
| Base (`base`) | ETH | 支持 | 不支持 |

## 开发

```bash
git clone https://github.com/Jimmy-Holiday/xxyy-trade-skill.git
cd xxyy-trade-skill/mcp
npm install
npm run build
```

使用 MCP Inspector 测试：

```bash
XXYY_API_KEY=xxyy_ak_xxx npx @modelcontextprotocol/inspector node dist/index.js
```

## 许可证

[MIT](../LICENSE)
