# StayPut / Thehro QA report

## Fixes applied after this audit (November 7, 2026)

| Finding | Status | Change |
| --- | --- | --- |
| 1. Local expiry starts before signing | Fixed | New receipts (v2) store `lifetimeMinutes`, not a wall-clock `expiresAt`. The reader shows anything the chain still returns and hides only entities whose `$expiresAt` block has passed; countdowns are estimates and trigger a re-query, never a local delete. Regression test: `chain expiry, not the pre-signing timestamp, decides receipt visibility`. |
| 2. Reopen changes rate breakdown | Fixed | `restoreScenario` restores the saved pool, reward mode, rate basis, assumed decline and fees. Legacy receipts without a consistent pool become an explicit "SNAPSHOT" with unknown breakdown instead of 0% rewards. |
| 3. Save dialog async state | Fixed | Name and lifetime live in `state.saveDraft`; dialog tokens ignore stale completions; duplicate connects are locked; the wallet button cancels a pending connection; results are attributed to the initiating wallet. |
| 4. Search misses displayed names | Fixed | Matches displayed names, slugs, network and pool description with normalized spaces, hyphens and underscores. |
| 5. Contrast and focus | Improved | Explanatory text darkened and enlarged to 11px or more; focus returns to the dialog opener; navigation focuses the page heading; skip link; debounced live result announcement. Not re-measured with a contrast tool or screen reader. |
| 6. Stale transaction link | Fixed | Account change and disconnect clear `lastTx` and the confirmation evidence. |
| Missing features | Added | Manual target APY (base + rewards), market pagination/sorting/counts, receipt pagination, pool description/TVL/30-day mean/pool link and restriction warnings, itemized fees, 30-day-mean basis and assumed rate decline with a "What if" table, lifetimes up to 7 days, opt-in local draft, share links, JSON export/import, EIP-6963 multi-wallet picker and mobile wallet deep links, confirmed-receipt evidence download. |

Still unverified: the real signed save → read-back → reopen → export → native expiry → delete lifecycle. It needs a funded wallet and your signature. `output/qa/reproduce.mjs` targets the pre-fix `main.js` and no longer applies; the equivalent checks are now in `test/scenario.test.js`.

Tested November 7, 2026, Asia/Kolkata.

**Verdict: the calculator and live-market browsing work. The complete wallet-backed product is not yet verified, and receipt correctness bugs should be fixed before a public demo.**

This is an audit, not a repair. Application source was not changed by this audit. The app was concurrently renamed from StayPut to Thehro by another session: testing began at `87559be` and the final build/browser smoke test used `30e40e4`. The existing directory and Arkiv schema intentionally retain the StayPut name.

## Evidence and coverage

| Area | Result | What was actually checked |
| --- | --- | --- |
| Existing automated suite | PASS | All 8 tests; rerun after the rename |
| Financial calculation | PASS | 1,280 combinations of principal, fee, APY and horizon compared with an independent ending-balance expression; max relative difference about 1.56e-12 |
| Production build | PASS | Vite build, also rerun after the rename |
| Built app in Chrome | PASS | Served `dist` at port 4173; initial render, 90-day comparison and live markets; no error-level console entries captured in this smoke test |
| Dependency audit | PASS | `npm audit --json` returned zero known advisories for the installed dependency tree; this is not a full security audit |
| Default scenario | PASS | $5,000 / 4.2% / 7.8% / $18 fees: staying ahead by $4.09 at 30 days; moving ahead by $24.14 at 90 days; break-even displayed as 39 days |
| Reward stress test | PASS | At 90 days, excluding rewards changes target to 4.9%, staying ahead by $9.87 and break-even to 197 days |
| Invalid input and ties | PASS | Zero amount and cost equal to principal show errors; equal APY and zero cost show a tie; other bounds exercised in unit checks |
| Live feed / browser CORS | PASS | Dev and production browser tabs loaded 177 eligible USDC pools; count is a snapshot, not a promised constant |
| Network filtering / pool selection | PASS | Aave V3 on Base selected correctly; Centrifuge long names also exercised |
| Protocol search | FAIL for displayed names | `aave v3` produced no matches; `aave-v3` produced matches |
| Unknown base APY | PASS | Live Fluid Lite pool displayed unknown base/reward and disabled Exclude rewards |
| Desktop / narrow layout | PARTIAL PASS | Visual checks of Compare, Markets, receipts empty state and save dialog; 390×844 browser override reported 354 CSS px in this Chrome setup; checked narrow Compare had no page overflow |
| Dialog keyboard behavior | PARTIAL | Escape closes the dialog; focus returns to BODY instead of its opener |
| Arkiv live read | PASS, empty-owner case only | CLI query on Rabdi for synthetic owner `0x0000000000000000000000000000000000000001` succeeded and returned zero entities |
| Arkiv adapter unit checks | PASS | 8 mocked checks: missing provider, invalid/valid account, account mismatch, invalid lifetime/key, add-chain/wrong-chain guard, and decoding/filtering receipt fixtures |
| Receipt lifecycle | NOT VERIFIED end to end | Browser wallet connection stayed pending; no create or delete transaction signed; real read-back/export/copy/native expiry still require a funded-wallet session |

The controlled receipt reproductions use actual source functions in a Node VM with DOM/network boundaries stubbed. They are not blockchain transaction tests. Run `node output/qa/reproduce.mjs` from this project to reproduce those findings. Artifacts under `output/` are ignored by Git.

## Fix first

### 1. Local receipt expiry starts before wallet approval — high priority

Location: `src/main.js:228`, `src/arkiv.js:50`, `src/arkiv.js:62`.

The JSON `expiresAt` is computed before wallet network switching and signing. Arkiv receives a relative lifetime for the entity, while the app hides it according to that earlier JSON timestamp. In the controlled reproduction, a 2-minute receipt with a 130-second wallet delay is already locally expired by 10 seconds when confirmation returns. It can be successfully created and immediately disappear from My receipts.

Update: separate scenario creation time from authoritative entity expiry. Use the confirmed expiration block returned by the SDK and chain timing/query state to determine visibility. Display any wall-clock countdown as an estimate; do not silently discard a live entity because signing took time. Test a delayed approval longer than the selected lifetime.

Arkiv documents native expiry in blocks and returns the entity's expiry from creation: [expiration](https://docs.arkiv.network/writing/expiration/), [entity creation](https://docs.arkiv.network/writing/create/).

### 2. Reopening a receipt changes its rate breakdown — high priority

Location: `src/main.js:233`.

The original numeric comparison is restored, but the pool is replaced with a synthetic object whose base equals the saved effective target APY, rewards equal zero, project name equals the receipt title, and network is “Saved scenario.” The saved `pool` and `excludeRewards` fields are ignored.

Controlled example: a receipt for 7.8% total / 4.9% base / 2.9% rewards reopens as 7.8% base / 0% rewards. Exclude rewards then no longer performs the original stress test. Re-saving also stores the altered metadata.

Update: validate and restore the saved pool snapshot and reward mode, keeping the recorded calculation inputs authoritative. For older receipts without enough metadata, show an explicit immutable snapshot with unavailable breakdown instead of inventing a zero reward rate.

### 3. Save dialog is unsafe across asynchronous updates — medium priority

Location: `src/main.js:214`, `src/main.js:223`.

While connecting from the save dialog, `busy` is not set and the dialog can be closed. When the connection promise resolves, the handler still writes to removed name/lifetime/error elements. The controlled reproduction produces an unhandled missing-element error. Duplicate clicks can also request another connection while the first is pending.

Separately, `renderModal()` recreates the name and lifetime from defaults. Pressing Save sets busy and rerenders, so the visible custom name/lifetime reset while the transaction uses the earlier captured values. Background renders can erase form edits before submission too.

Update: store the draft in state; lock duplicate connection requests; guard async completions with a dialog/session token; do not write into a dialog that has closed. Keep the submitted name and lifetime visible during confirmation.

### 4. Search does not match the names users see — medium priority

Location: `src/main.js:126`.

The UI displays pretty protocol names but searches raw slugs. Browser reproduction: “Aave V3” → no matches; “aave-v3” → 10 matches at test time. Leading/trailing spaces are not trimmed either.

Update: search both `prettyProject(project)` and the raw identifier; normalize spaces/hyphens and trim the query. Add regression cases for Aave V3, Compound V3, Fluid Lite and names with whitespace.

### 5. Text contrast and focus need improvement — medium priority

Location: `src/style.css`, `src/main.js:209`.

Computed browser colors gave approximately 3.45:1 for introductory copy, 3.00:1 for field notes, 3.03:1 for the rate breakdown, and 2.22:1 for footer text. These are small 9–13px text samples, below the 4.5:1 normal-text target in [WCAG contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Some labels are also very small for mobile reading.

Closing Methodology with Escape leaves `document.activeElement` as BODY. Full page rerenders on navigation/presets also remove the focused control.

Update: darken explanatory text, enlarge important labels and hit targets, restore focus to dialog openers, and establish predictable focus after navigation. Announce changed calculation results without repeatedly moving keyboard focus. Full screen-reader and contrast coverage is still outstanding.

### 6. Switching wallets retains the previous transaction link — medium/low priority

Location: `src/main.js:219`, `src/main.js:250`.

Account changes and disconnect clear receipts but not `lastTx`. A controlled account-change test retains the previous wallet's “Last confirmed transaction.” It is misleading account-scoped feedback, not a transfer-of-funds issue.

Update: clear transaction state and timestamps on disconnect/account change; associate async write results with the initiating wallet so a later completion cannot be attributed to another account.

## Smaller correctness and clarity issues

| Issue | Evidence / implication | Suggested update |
| --- | --- | --- |
| Pool identity disappears from comparison | Markets shows `poolMeta`, such as the particular Centrifuge fund, but the target panel shows only protocol/network. Different pools under the same protocol become difficult to distinguish. | Keep the exact vault/pool name and a pool-specific source link in Compare and saved snapshots. |
| APY components are incompletely validated | `normalizePools` permits any finite base/reward APY. A fixture with total 5%, base -3%, reward 8% passes normalization, then Exclude rewards triggers a calculation error. Not observed in a selected live pool during this session. | Make unsupported component values unavailable, or support the intended range consistently. |
| Receipt metadata validation is weak | Extremely large finite timestamps and malformed pool IDs pass `validateReceipt`; numeric calculation validation is stronger. | Bound timestamps to valid dates; validate provenance, pool metadata, source/attribute consistency and payload size. Preserve safe legacy behavior. |
| Minimum amount message disagrees with validation | Error says minimum $0.01, but amount 0.001 with zero fee passes `assertInputs`. | Either enforce 0.01 or deliberately support USDC sub-cent precision and update the message/input minimum. |
| Long horizons are inconsistent | Receipt validation allows up to 3,650 days; slider clamps display to 365 on restore. | Use the same supported range or add a custom days input. |
| Receipt tie caption differs | Compare has a half-cent tie tolerance; receipt cards use only `advantage > 0`, so an exact tie says “$0.00 more by staying.” | Share one result classification helper. |
| Receipt countdown does not tick continuously | The interval rerenders only when an entity expires; “~30m left” can remain unchanged until then or refresh. | Update displayed remaining time periodically without rebuilding the whole form/page. |
| Pending wallet state lacks recovery guidance | The test tab stayed at Connecting without an in-app explanation/retry/cancel path. This does not establish that the wallet adapter is broken; the extension may be awaiting user action. | Show “Open/unlock your wallet,” pending-request handling and a safe dismiss/retry path. |

## Missing features and useful upgrades

These are product gaps, not all release blockers. Keep the scope small for a demo.

1. **Manual target APY:** currently the current rate is editable but the destination must be a listed pool or one of three examples. Add a clearly labeled manual target mode.
2. **Complete market browsing:** only the first 40 matches appear; there is no next page/load more. Add pagination, sorting and a clear total count. Receipt reads also stop at 100.
3. **Pool suitability context:** preserve lockup/eligibility metadata and links. The live feed includes funds and pools with different restrictions. A USDC symbol and $1M TVL do not make opportunities equivalent.
4. **Rate sensitivity:** compare current APY with the supplied 30-day mean; let users stress-test APY declines or reward duration. The existing calculation assumes unchanged effective APYs.
5. **Fee breakdown:** split withdrawal, gas, bridge, entry and slippage assumptions. Live estimates are optional future work; entered costs should remain transparent.
6. **Draft persistence and sharing:** refresh currently loses inputs, selected pool and market list. Add a local draft/reset option, scenario links or JSON import/export without requiring an onchain receipt. Make any persistence of amounts clear to users.
7. **Mobile wallet support:** only `window.ethereum` is supported. Add provider discovery/selection and a mobile connector if mobile users are in scope.
8. **Receipt usefulness beyond a short demo:** offer longer lifetimes where appropriate and a separate local export/archive flow. Do not imply expired public data was erased from blockchain history.
9. **Integration reliability:** use an origin-restricted public Arkiv access key; show distinct timeout/rate-limit/wallet-cancel states; cache the large yield feed and make selected quote age visible. Keep the selected snapshot timestamp unchanged until explicitly refreshed.
10. **Maintainable structure:** split state, rendering, dialog drafts, wallet lifecycle and receipts out of the single main module. Avoid replacing the complete app DOM for unrelated async updates.
11. **Repeatable QA/CI:** current committed tests cover math/data only. Add browser flows and adapter fixtures for these bugs, then run tests/build on PRs. Pin the Arkiv SDK version deliberately instead of `latest`; the current lockfile already provides reproducibility with `npm ci`.
12. **Public demo evidence:** README/SUBMISSION still list signed writer evidence, a public repository, judge-accessible deployment and a recorded demo as pending. Verify their current status before presenting; this audit did not change hosting access or publish anything.

## What remains unverified

- Real wallet connect/sign rejection, insufficient test funds, chain switching with a real extension, successful create → query → reopen → export/copy → native expiration, and owner-authorized deletion.
- Proof of native expiry independent of the application's local time filter.
- Network timeout/offline/429 behavior in the browser under controlled failures; corresponding handlers were reviewed, not all failure responses reproduced.
- Safari, Firefox, actual iOS/Android wallets, screen readers, 200% zoom and every responsive breakpoint.
- Public deployment access, security headers and performance over a slow mobile connection. Browser testing used local dev and built production servers.
- No formal contract/security audit, financial-risk assessment, or assertion that a listed pool is safe or suitable.

Readonly entities are still deletable by their owner according to [Arkiv's creation documentation](https://docs.arkiv.network/writing/create/). The readonly flag itself is not a deletion defect.

## Recommended order

1. Fix expiry, receipt restoration and async save state.
2. Complete one real funded-wallet lifecycle and capture entity key/transaction/query evidence.
3. Fix search, preserve pool identity, improve contrast/focus and clear wallet-scoped transaction feedback.
4. Add pagination, manual target rates and draft persistence.
5. Verify public demo access and update the README's now-outdated claim that browser QA could not run.

Screenshots: `output/qa/production-desktop.jpg`, `output/qa/production-mobile.jpg`, and `output/qa/mobile-save.jpg`. Early screenshots use StayPut branding; production screenshots use the concurrent Thehro rename. Browser full-page captures may crop the far edge in this Chrome configuration; layout overflow was separately checked through DOM geometry.
