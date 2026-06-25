# Verification Record / 可核查使用记录

This repository includes a public, redacted record for judging the Trading Infra workflow.

本仓库提供一份可公开核查、已脱敏的样本输入/输出，用于评委复现 Trading Infra 工作流。它证明 BlackBox Court 可以把交易 Agent 的交易意图转换为可审计的预交易风控裁决，而不是只展示一个静态 UI。

- [Sample request and evaluated output / 脱敏样本输入与输出](../examples/pre-trade-evaluation.sample.json)
- [Chinese usage guide / 中文使用说明](./USAGE_ZH.md)
- Public deployment / 在线 Demo: <https://blackbox-court.vercel.app>
- Evaluation endpoint: `POST /api/court/evaluate`

## What the record proves / 这份记录证明什么

The sample captures one full pre-trade gate evaluation: trade intent, Bitget public market snapshot, deterministic policy-gate results, the `reduce` decision, and the resulting paper-position estimate. It intentionally excludes credentials and private balance values.

中文说明：样本记录包含一次完整的预交易评估，包括交易意图、Bitget 公开市场快照、确定性策略门禁、`reduce` 减仓裁决，以及由该裁决生成的模拟持仓估算。样本已经移除 API Key、账户余额和任何私人信息。

评委可以重点核查：

- `request`：Agent 或用户提交的交易请求。
- `marketSnapshot`：Bitget 行情证据与数据来源标识。
- `policyGates`：止损、风险预算、名义金额、波动、趋势质量等规则检查。
- `verdict` / `riskScore`：最终裁决和风险分。
- `paperExecution`：仅用于说明的模拟持仓结果，不代表实盘收益。

## Reproduce / 如何复现

Run the application locally, then submit a request such as:

```bash
curl -X POST http://localhost:3000/api/court/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Long BTC 900 USDT. Max loss 1%. Stop below swing low.",
    "symbol": "BTCUSDT",
    "timeframe": "1H",
    "notional": 900,
    "maxRiskPct": 1,
    "policyPack": "balanced",
    "locale": "en"
  }'
```

Market fields will change with live Bitget data. The response always identifies the source or fallback state, returns policy gates and a verdict, and never places a live order.

中文复现说明：本地运行项目后，用上面的 `curl` 请求调用 `/api/court/evaluate`。由于行情来自实时 Bitget 公开数据，价格、资金费率、波动率等字段会变化；但返回结构、策略门禁、裁决逻辑和安全边界应保持一致。

## Safety boundary / 安全边界

The project uses public Bitget market data by default. Optional Bitget credentials are read-only and are never committed to this repository. `paperExecution` is not a demo-exchange order, persistent execution log, or performance claim.

中文说明：项目默认只使用 Bitget 公开行情。可选 Bitget 凭证仅用于只读账户上下文，不能提交到 GitHub。`paperExecution` 是应用内基于快照的模拟估算，不是外部交易所 demo order，也不是收益证明。
