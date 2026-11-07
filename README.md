# Thehro (ठहरो)

Thehro means “pause” or “wait” in Hindi: take a moment to check whether a higher APY is worth the cost of moving. Renamed from StayPut on November 7, 2026. The existing `stayput/` directory, hosted URL and Arkiv schema identifier are retained for continuity.

**Is chasing that APY worth it?** Thehro compares the dollars you would earn by keeping a USDC position against moving it after fees. It shows the break-even day and lets you save the exact scenario as an expiring, wallet-owned receipt on Arkiv.

**One partner, one track:** Arkiv — **Build on Arkiv (from scratch)** at ETHGlobal Mumbai 2026. DeFiLlama is a data source, not an additional partner-track submission.

## Run

Requires Node.js 22.10+ and npm.

```sh
npm ci
npm run dev
```

The dev server prints its local URL. The app opens on Markets and immediately fetches USDC pools from DeFiLlama, then refreshes them automatically every 5 minutes while the tab is visible. It works without a wallet, and clearly labeled illustrative scenarios remain available. Select a pool to compare it.

```sh
npm test
npm run build
npm run preview
```

The production output is `dist/`. This is a static Vite application; it can be hosted on any static web host. The Sites preview is owner-private and is not a public judge-facing link.

## Save a real Arkiv receipt

1. Open the app in a normal browser with an injected EVM wallet, such as MetaMask. An embedded preview may not expose wallet extensions.
2. Connect your wallet. Get **test tGLM** from https://hub.arkiv.network/faucet.
3. Make a comparison → Save receipt. Select 2 minutes for a quick expiration demo, or 15 minutes up to 7 days.
4. Accept adding/switching to **Arkiv Rabdi**, chain ID **7794095**, then approve the create-entity transaction in your wallet.
5. My receipts queries Arkiv for your wallet-owned entities. Reopen the receipt to restore its assumptions; export the JSON or copy the entity key.
6. After expiration, refresh: the entity is absent from Arkiv query results. Visibility is decided only by the entity's on-chain expiry block; the countdown is an estimate from `getBlockTiming`, and the page re-queries Arkiv once that estimate passes. A slow wallet approval does not shorten a receipt's life, because the lifetime starts when the transaction lands.

Without a wallet you can still keep and share work: **Remember on this device** stores a local draft, **Copy share link** encodes the scenario in the URL fragment (never sent to a server), and **Export JSON / Import** round-trip the exact scenario, including downloaded Arkiv receipts. On phones with no injected wallet, the connect dialog offers deep links that reopen Thehro inside MetaMask, Coinbase Wallet or Trust Wallet. Multiple desktop extensions are discovered through EIP-6963.

Only receipt storage uses transactions. Thehro does not deposit, withdraw, bridge, swap, approve tokens, or hold keys. Receipts are public. Expiration is removal from current queries, **not erasure of blockchain history**.

Optional: copy `.env.example` to `.env` and set an origin-restricted public Arkiv access key from https://hub.arkiv.network/access-keys. The public RPC is heavily rate limited. Never put a private key in `VITE_*` variables.

## Reproduce a read

```sh
npm run query -- 0xYOUR_WRITER_WALLET_ADDRESS
```

This uses the same schema and owner-filtered query as the UI. Set `ARKIV_ACCESS_KEY` in the process environment when using a private rate-limit allocation. The CLI does not load `.env` automatically.

**Writer wallet / transaction / entity key:** pending the user's first wallet transaction. No write has been performed by the coding agent, and no transaction hash is fabricated. After saving, use Download receipt to record the owner and entity key; copy the confirmed transaction link from the app. Add those real values here before submitting.

## Architecture

```text
Browser ── read-only HTTP ──> DeFiLlama public yield feed
   │                          single-asset USDC, TVL >= $1M
   ├── deterministic APY/cost calculator and SVG chart
   └── injected wallet ── signed transaction ──> Arkiv Rabdi
            no app-held keys                    │
                   My receipts <── SDK query ───┘
```

- `src/math.js`: numeric validation, effective-APY compounding, analytic break-even, chart data, pool and receipt validation.
- `src/data.js`: public yield feed (cached 5 minutes), search over displayed names and slugs, sorting, manual target pools, pool links and restriction/volatility warnings.
- `src/scenario.js`: effective target rate (reported, 30-day mean, base-only, assumed decline), scenario cleaning, lossless restore, share-link and JSON encoding.
- `src/storage.js`: opt-in local draft.
- `src/wallets.js`: EIP-6963 wallet discovery and mobile wallet deep links.
- `src/arkiv.js`: named schema, paginated owner-filtered reads, wallet-signed create/delete, chain-authoritative expiry, read-only creation flag.
- `src/main.js`: compare, markets and receipts UI, itemized fees, rate-sensitivity table, dialogs, wallet and failure states.
- `test/math.test.js`, `test/scenario.test.js`: financial formula, edge cases, untrusted input, receipt restore, expiry visibility, search, drafts, share links and wallet discovery.
- `arkiv/`: schema and all four judging-criteria documents.

## Math and limitations

For principal `P`, one-time switching cost `C`, current effective annual yield `a`, target yield `b`, and days `d`:

```text
Stay ending balance = P × (1+a)^(d/365)
Move ending balance = (P−C) × (1+b)^(d/365)
Net advantage = Move − Stay
Break-even days = 365 × ln(P/(P−C)) / (ln(1+b) − ln(1+a))
```

Rates are decimals in these formulas. Break-even exists for positive costs only when `b > a`. Equal rates and no costs are an immediate tie. Displayed earnings subtract the original principal, so a costly move can have negative net earnings.

- Switching costs are entered by the user; there is no live gas, bridge, withdrawal-fee or slippage estimate.
- Rates are held constant, USDC is assumed to remain at $1, and effective APY is prorated using fractional-year compounding. Reward yield is assumed realizable and reinvestable when included.
- Taxes, lockups, liquidity constraints, depegs, protocol failure and changes in yield are not modeled. A numerical winner is not a risk-adjusted recommendation.
- TVL is a size filter, not evidence of safety. The feed may include permissioned or institution-only pools; users must investigate actual eligibility separately.
- The public feed does not include a pool observation timestamp. The app records **retrieval time**, not proof of fresh or verified rates. Refreshing the market list does not rewrite an already-selected pool's retrieval time.
- Missing base APY disables the exclude-rewards toggle. Base APY can itself include subsidies; the toggle is not a complete measure of organic yield.
- Receipt content is wallet-signed user data, not an oracle attestation. Read queries are scoped to the connected wallet. Untrusted payloads are validated before use.
- The first 100 active receipts are displayed; there is no pagination yet. Expired records are not an archive.
- Only injected wallets are supported. There is no WalletConnect integration or mobile wallet connector.
- Fonts are requested from Google Fonts; the page falls back to system sans-serif if unavailable. No analytics or tracking SDK is installed.

## Verification status

- Calculation and data-validation tests pass; production build passes.
- Public DeFiLlama feed checked: valid response, with matching USDC pools.
- Live owner-filtered Arkiv read checked on Rabdi using the implemented schema (empty result for a non-writer address, as expected).
- Browser visual/interaction QA could not run because the computer-use browser host was unavailable in this environment. Responsive CSS is implemented, but desktop/mobile screenshots are not verified.
- Live wallet write/read/expiry demonstration is pending the user connecting and signing. The user explicitly chose to connect later.

## Submission

See `SUBMISSION.md` for a 2–3 minute demo script and outstanding evidence. A public open-source repository and a judge-accessible live deployment still need to be supplied; the Sites source repository and owner-private preview do not satisfy those requirements on their own.

## AI use and provenance

Built from scratch during this session with Codex assistance for research, UI design, implementation, math tests and documentation. The builder must review and understand the code before presenting it. No earlier project-specific code was reused. Uses public npm libraries: Arkiv SDK, viem, Vite and Lucide.

See `RESEARCH.md` for sources and the limits of the X research. Licensed MIT.
