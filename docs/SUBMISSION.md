# BlackBox Court Submission Notes

## One-line pitch

BlackBox Court is a drop-in pre-trade risk gate for Bitget-connected agents: one API call returns a policy verdict, Bitget market evidence, a paper-position snapshot, and a replayable audit id.

中文一句话：BlackBox Court 是给交易 Agent 使用的预交易风控网关；Agent 下单前调用一次 API，就能得到策略裁决、Bitget 行情证据、模拟持仓快照和可复查的审计 ID。

## What is real in the demo

- Public Bitget data: candles, ticker, funding, and open interest when reachable
- Optional read-only private account context, used as an extra policy gate
- Every evaluation creates an audit record and exportable JSON bundle
- Paper Position Evidence is a transparent snapshot estimate: entry, mark, stop, target, quantity, fee, slippage, and snapshot PnL

中文说明：Demo 中真实完成的是风控评估流程、行情证据读取、策略门禁判断、模拟持仓估算和审计记录导出。它展示的是“Agent 执行前如何被约束和复查”，不是收益率包装。

## What is intentionally not claimed

- No live orders are sent by this application
- The in-app paper position is not an externally verified Bitget demo trade
- A public GetAgent Studio or external paper-log link is shown only after `PAPER_LOG_URL` is configured

## Optional three-minute video sequence

Use this only if you decide to submit a demo video. The project can still be reviewed through the public GitHub repository, live demo, verification notes, and sample JSON.

1. **0:00-0:20** - Show the execution control line: Bot -> evaluate -> verdict -> paper evidence -> audit.
2. **0:20-0:50** - Run a clean trade sample. Show Bitget signals, policy passes, and the Paper Position Evidence card.
3. **0:50-1:20** - Run the no-stop sample. Show the block/hold verdict, failed gates, and decision log.
4. **1:20-1:50** - Expand Safety Impact: intervention rate, withheld exposure, verdict mix, and risk reasons.
5. **1:50-2:20** - Open the generated report and download its audit bundle.
6. **2:20-2:45** - Open `/developers`, copy the evaluate curl, and show the agent integration steps.
7. **2:45-3:00** - Open the configured public GetAgent / paper-log evidence link, if available.

## Submission evidence

- Public GitHub repository with a runnable README
- Public verification notes and redacted sample input/output
- Live deployment link, if available
- Optional demo video under the official time limit
- Optional external paper-trading evidence link, configured as `PAPER_LOG_URL`
- Required project form and social post, following the final official instructions

中文提交材料建议：

- GitHub 仓库：公开、可运行、包含 README 和环境变量说明。
- 可核查使用记录：提交 `docs/VERIFICATION.md` 链接。
- 样本输入/输出：提交 `examples/pre-trade-evaluation.sample.json` 链接。
- 在线 Demo：提交 Vercel 链接。
- 演示视频：选填；如果录制，控制在 3 分钟内，重点展示一次允许/减仓和一次拦截案例。
- 外部 paper-log：选填；只有在 GetAgent Studio 或其他平台已经公开可访问时再提交。
