# BlackBox Court

**Pre-trade risk gate for trading agents** - one API call before execution reaches Bitget.

BlackBox Court evaluates a trade brief against policy rules, Bitget market evidence, and optional read-only account context. It returns a verdict, a paper-position snapshot, and a replayable audit record.

```text
Agent / Bot -> POST /api/court/evaluate -> allow | reduce | watch | block -> Audit bundle
```

## What is concrete in this repository

- Pre-trade policy checks: direction, stop/invalidation, risk budget, notional, volatility, trend quality
- Bitget public data: candles, ticker, funding, open interest, with explicit fallback labeling
- Optional read-only Bitget account context: available USDT becomes a policy gate when configured
- Paper Position Evidence: simulated side, entry, mark, stop, target, quantity, snapshot PnL, fee, and slippage
- Audit records and JSON export for every evaluation
- Safety impact dashboard: intervention rate, withheld exposure, verdict distribution, and top risk reasons

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. Use a sample case or enter your own trade brief. Audit records persist in `data/blackbox-records.json` when the app runs with a persistent disk.

## API

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

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/court/evaluate` | Evaluate and persist an audit record |
| GET | `/api/court/stats` | Read safety-impact aggregates |
| GET | `/api/court/records` | Read audit history |
| GET | `/api/court/records/{id}/export` | Download an audit bundle |
| POST | `/api/court/demo-seed` | Local recording helper that creates sample records |

## External paper-trade evidence

The in-app paper position is a transparent snapshot estimate, not a Bitget demo order. If you publish a GetAgent Studio or external paper-trade log, configure:

```env
PAPER_LOG_URL=https://your-public-paper-log-or-getagent-studio-link
```

The link appears on `/developers` only when configured. This keeps the claim honest and makes external evidence inspectable without implying that it is required for the core Trading Infra demo.

## Public verification

- Live demo: <https://blackbox-court.vercel.app>
- [Redacted evaluation sample](examples/pre-trade-evaluation.sample.json)
- [Reproduction and safety notes / 可核查使用记录与复现说明](docs/VERIFICATION.md)
- [Chinese usage guide / 中文使用说明](docs/USAGE_ZH.md)

For Chinese-speaking judges: start with `docs/VERIFICATION.md` and `docs/USAGE_ZH.md`. They explain what the redacted sample proves, how to reproduce the request, and why the paper-position output is evidence of a risk-gate decision rather than a live trading claim.

中文评委可优先查看 `docs/VERIFICATION.md` 和 `docs/USAGE_ZH.md`：里面说明了脱敏样本证明什么、如何复现请求，以及为什么模拟持仓只是风控裁决证据，不是实盘收益声明。

## Docs

- [Chinese usage guide](docs/USAGE_ZH.md)
- [Integration guide](docs/INTEGRATION.md)
- [Submission notes](docs/SUBMISSION.md)
- [Submission checklist](docs/USER_CHECKLIST.md)
- [Agent Hub setup](docs/AGENT_HUB.md)
- [Verification record](docs/VERIFICATION.md)

## Track

Bitget AI Hackathon S1 - **Trading Infra**
