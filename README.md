# Thehro (ठहरो)

Thehro means “pause” or “wait” in Hindi: take a moment to check whether a higher APY is worth the cost of moving.

**Is chasing that APY worth it?** Thehro compares the dollars you would earn by keeping a USDC position against moving it after fees, and shows the break-even day.

Built for **Arkiv — Build on Arkiv (from scratch)** at ETHGlobal Mumbai 2026.

## Run

Requires Node.js 22.10+ and npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

The app opens on Markets and fetches single-asset USDC pools (TVL ≥ $1M) from the public DeFiLlama yield feed, then refreshes them every 5 minutes while the tab is visible. Search, filter by network, sort and page through pools, then select one to compare. Three clearly labeled illustrative scenarios remain available offline, or enter your own target APY. Arkiv receipts are coming next.

Stress-test a move: itemize withdrawal, gas, bridge, entry and slippage costs; switch the target rate between reported APY and its 30-day mean; assume the rate falls by a percentage; and read the **What if the rate changes?** table, including a "rewards end" row.

Keep and share work without a wallet: **Remember on this device** stores a local draft, **Copy share link** encodes the scenario in the URL fragment (never sent to a server), and **Export JSON / Import** round-trip the exact scenario. Imported data is validated before use.

- `src/math.js`: input validation, effective-APY compounding, analytic break-even, chart data, pool and scenario validation.
- `src/data.js`: public yield feed (cached 5 minutes), search, sorting, manual target pools, pool links and restriction/volatility warnings.
- `src/scenario.js`: effective target rate (reported, 30-day mean, base-only, assumed decline), scenario cleaning, lossless restore, share-link and JSON encoding.
- `src/storage.js`: opt-in local draft.
- `src/main.js`: Compare and Markets views, scenario tools, itemized fees, rate-sensitivity table, SVG chart, dialogs.

TVL is a size filter, not evidence of safety. The app records **retrieval time**, not a per-pool observation timestamp.

## Math

For principal `P`, one-time switching cost `C`, current effective annual yield `a`, target yield `b`, and days `d`:

```text
Stay ending balance = P × (1+a)^(d/365)
Move ending balance = (P−C) × (1+b)^(d/365)
Net advantage = Move − Stay
Break-even days = 365 × ln(P/(P−C)) / (ln(1+b) − ln(1+a))
```

Break-even exists for positive costs only when `b > a`. Rates are held constant, USDC is assumed to stay at $1, and taxes, lockups and protocol risk are not modeled.

Licensed MIT.
