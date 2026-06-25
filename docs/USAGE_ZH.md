# BlackBox Court 中文使用说明

## 它解决什么问题

BlackBox Court 不是交易策略，也不会替用户真实下单。它是交易 Agent 在执行前调用的预交易风控网关：检查方向、止损、风险预算、名义金额、波动、趋势质量，以及可选的只读账户余额，然后返回允许、减仓、观察或拦截。

```text
交易 Agent -> POST /api/court/evaluate -> 策略裁决 -> 模拟持仓证据 -> 审计记录
```

核心目标是让评委或开发者可以复查：一笔交易为什么被允许、为什么被缩小仓位、或者为什么被拦截。

## 页面如何看

1. 打开在线 Demo 或本地 `http://localhost:3000/?lang=zh`。
2. 在左侧填写交易说明，或点击示例场景。
3. 点击“评估交易”。
4. 在右侧查看裁决、Bitget 市场信号、策略检查和风险原因。
5. 如果系统允许模拟执行，会出现“模拟持仓证据”：方向、入场价、标记价、止损、目标、数量、手续费、滑点和快照 PnL。
6. 打开完整报告或下载审计包，可以复盘本次判断。

## Bot 如何接入

在 Bot 将订单发送到执行器前，先调用：

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

裁决含义：

- `allow`：可以进入你的 paper executor 或已批准的交易执行器。
- `reduce`：只按 `allowedNotional` 缩小仓位执行。
- `watch` / `block`：不要发单，先处理 `noTradeReasons`。

## 可核查使用记录

提交给评委时，建议同时提供以下三个链接：

- GitHub 仓库：项目源码、README、运行方式和环境变量说明。
- 可核查记录：`docs/VERIFICATION.md`，说明样本输入、输出、复现步骤和安全边界。
- 样本 JSON：`examples/pre-trade-evaluation.sample.json`，包含脱敏后的请求、市场快照、策略门禁、裁决和模拟持仓结果。

这些材料能证明本项目不是只有界面，而是有可复现的预交易评估流程。样本中的行情字段会随 Bitget 实时数据变化，评委复现时重点看字段结构、裁决规则、风险原因和是否明确标注数据来源。

## 外部模拟交易证明

应用内的模拟持仓是基于当前评估快照生成的透明估算，不是外部交易平台的真实 paper order。

如果你已经在 GetAgent Studio 或其他平台发布可公开验证的模拟交易记录，在 `.env` 里配置：

```env
PAPER_LOG_URL=https://你的公开记录链接
```

重启应用后，`/developers` 会展示该链接。这样评委可以分别核验：应用内的风控证据链，以及外部平台的 paper-trade 记录。

## 安全边界

- 默认只使用 Bitget 公开行情数据。
- Bitget 私钥为可选只读上下文，只应放在本地或 Vercel 环境变量中。
- 仓库中不要提交任何 API Key、账户余额、真实身份信息或未脱敏日志。
- 本项目不会直接发送真实订单。
