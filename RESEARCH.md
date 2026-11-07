# Research and concept

Reviewed November 6, 2026.

## Direction

The user asked for one partner and one track, then selected finance rather than a hackathon collaboration app. Thehro is a scoped finance decision tool: compare yield in dollars after switching costs, stress-test incentive dependence, and save a time-bounded record of the assumptions.

The distinguishing demo is not a generic APY leaderboard: a higher headline rate can lose for a short holding period and win for a longer one. The corresponding decision receipt expires, so an old scenario does not stay in the active decision list indefinitely. This is a product hypothesis, not a claim that no similar calculator exists.

## X research limitation

Searched publicly indexed X results for hackathon blockers, Arkiv Mumbai, yield chasing, APY and gas fees. The results were sparse, irrelevant or login-gated. No usable representative sample of X discussion was obtained. Consequently, the product is **not described as validated by X or based on an observed X trend**. No posts were sent or accounts accessed.

## Primary sources

- ETHGlobal Mumbai prize page: https://ethglobal.com/events/mumbai/prizes — Arkiv Build on Arkiv (from scratch) requires genuine reads and writes, schema, owner addresses, runnable query, feedback and criteria files.
- Arkiv fundamentals: https://docs.arkiv.network/start-here/fundamentals/ — wallet-owned queryable entities and native expiration.
- Arkiv first entity: https://docs.arkiv.network/start-here/first-entity/ — SDK schema, clients, create and read.
- Arkiv expiry: https://docs.arkiv.network/writing/expiration/ — block-based expiry and read behavior.
- Arkiv create: https://docs.arkiv.network/writing/create/ — read-only creation flag and transaction evidence.
- DeFiLlama adapters and APY methodology: https://github.com/DefiLlama/yield-server — base/reward yield, effective feed structure and data-source requirements.
- DeFiLlama official API documentation: https://github.com/DefiLlama/api-docs — documentation and endpoint categories.
- Live endpoint tested: https://yields.llama.fi/pools — successful JSON response. A single retrieval returned 15,703 total pools and 178 matching the app's USDC/TVL/single-exposure filters. Counts and rates are not baked into the UI and will change.

## Scope choice

Arkiv is the only sponsor integration. DeFiLlama supplies financial data; this is not a second prize-track entry. No custom contracts, token issuance, swaps, cross-chain execution, oracle attestation or AI inference are necessary for this MVP.
