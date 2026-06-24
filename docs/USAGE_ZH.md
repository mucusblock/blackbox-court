# BlackBox Court 中文使用说明

## 它解决什么问题

BlackBox Court 不是交易策略，也不替用户下单。它是交易 Agent 在执行前调用的风控闸门：检查方向、止损、风险预算、仓位、波动、趋势和可选的只读账户余额，然后返回可执行、减仓、观察或拦截。

```text
交易 Agent -> POST /api/court/evaluate -> 策略裁决 -> 模拟持仓证据 -> 审计记录
```

## 页面如何看

1. 左侧填写交易说明或点击示例场景。
2. 点击“评估交易”。
3. 右侧查看裁决、Bitget 市场信号和策略检查。
4. 如果允许模拟执行，会出现“模拟持仓证据”：方向、入场价、标记价、止损、目标、数量和快照 PnL。
5. 打开完整报告或下载审计包，复盘这次判断。

## Bot 如何接入

在 Bot 将订单发送到执行器前调用：

```bash
curl -X POST http://localhost:3000/api/court/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "做多 BTC，900 USDT，最大亏损 1%，止损放在前低下方。",
    "symbol": "BTCUSDT",
    "timeframe": "1H",
    "notional": 900,
    "maxRiskPct": 1,
    "policyPack": "balanced",
    "locale": "zh"
  }'
```

执行规则：

- `allow`：可以进入你的 paper executor 或批准的交易执行器。
- `reduce`：只按 `allowedNotional` 缩小仓位执行。
- `watch` / `block`：不要发单，先处理 `noTradeReasons`。

## 外部模拟交易证明

应用内的模拟持仓是基于当前评估快照生成的透明估算，不是外部交易平台的真实 paper order。

如果你已在 GetAgent Studio 或其他平台发布可公开验证的模拟交易记录，在 `.env` 里配置：

```env
PAPER_LOG_URL=https://你的公开记录链接
```

重启应用后，`/developers` 会展示该链接。这样评委可以分别核验：应用内的风控证据链，以及外部平台的 paper-trade 记录。
