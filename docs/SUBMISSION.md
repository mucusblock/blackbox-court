# BlackBox Court Submission Notes

## One-line pitch

BlackBox Court is a drop-in pre-trade risk gate for Bitget-connected agents: one API call returns a policy verdict, Bitget market evidence, a paper-position snapshot, and a replayable audit id.

## What is real in the demo

- Public Bitget data: candles, ticker, funding, and open interest when reachable
- Optional read-only private account context, used as an extra policy gate
- Every evaluation creates an audit record and exportable JSON bundle
- Paper Position Evidence is a transparent snapshot estimate: entry, mark, stop, target, quantity, fee, slippage, and snapshot PnL

## What is intentionally not claimed

- No live orders are sent by this application
- The in-app paper position is not an externally verified Bitget demo trade
- A public GetAgent Studio or external paper-log link is shown only after `PAPER_LOG_URL` is configured

## Three-minute video sequence

1. **0:00-0:20** - Show the execution control line: Bot -> evaluate -> verdict -> paper evidence -> audit.
2. **0:20-0:50** - Run a clean trade sample. Show Bitget signals, policy passes, and the Paper Position Evidence card.
3. **0:50-1:20** - Run the no-stop sample. Show the block/hold verdict, failed gates, and decision log.
4. **1:20-1:50** - Expand Safety Impact: intervention rate, withheld exposure, verdict mix, and risk reasons.
5. **1:50-2:20** - Open the generated report and download its audit bundle.
6. **2:20-2:45** - Open `/developers`, copy the evaluate curl, and show the agent integration steps.
7. **2:45-3:00** - Open the configured public GetAgent / paper-log evidence link, if available.

## Submission evidence

- Public GitHub repository with a runnable README
- Demo video under the official time limit
- External paper-trading evidence link, configured as `PAPER_LOG_URL`
- Required project form and social post, following the final official instructions
