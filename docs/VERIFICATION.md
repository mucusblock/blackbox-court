# Verification Record

This repository includes a public, redacted record for judging the Trading Infra workflow:

- [Sample request and evaluated output](../examples/pre-trade-evaluation.sample.json)
- Public deployment: <https://blackbox-court.vercel.app>
- Evaluation endpoint: `POST /api/court/evaluate`

## What the record proves

The sample captures one full pre-trade gate evaluation: trade intent, Bitget public market snapshot, deterministic policy-gate results, the `reduce` decision, and the resulting paper-position estimate. It intentionally excludes credentials and private balance values.

## Reproduce

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

## Safety boundary

The project uses public Bitget market data by default. Optional Bitget credentials are read-only and are never committed to this repository. `paperExecution` is not a demo-exchange order, persistent execution log, or performance claim.
