import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, growth, chartPoints, normalizePools, validateReceipt } from '../src/math.js';
const inputs = { amount: 5000, currentApy: 4.2, targetApy: 7.8, days: 30, cost: 18 };
test('effective APY produces the stated annual return', () => {
  assert.ok(Math.abs(growth(1000, 10, 365) - 100) < 1e-9);
});
test('switching costs are deducted before compounding', () => {
  const result = compare({ amount: 1000, currentApy: 0, targetApy: 10, days: 365, cost: 100 });
  assert.ok(Math.abs(result.move - -10) < 1e-9);
  assert.equal(result.stay, 0);
});
test('break-even solves for equal ending balances', () => {
  const { breakEven } = compare(inputs);
  assert.ok(breakEven > 0);
  assert.ok(Math.abs(compare({ ...inputs, days: breakEven }).advantage) < 1e-8);
});
test('equal or lower yield never recovers a switching cost', () => {
  assert.equal(compare({ ...inputs, targetApy: 4.2 }).breakEven, null);
  assert.equal(compare({ ...inputs, targetApy: 2 }).breakEven, null);
  assert.equal(compare({ ...inputs, cost: 0 }).breakEven, 0);
});
test('rejects invalid money, rates, horizon and non-finite values', () => {
  for (const patch of [{amount:0},{cost:5000},{cost:-1},{days:0},{days:Infinity},{currentApy:NaN},{targetApy:-1}])
    assert.throws(() => compare({...inputs,...patch}));
});
test('chart agrees with the final comparison and starts at the cost', () => {
  const points = chartPoints(inputs);
  assert.equal(points[0].move, -18);
  assert.equal(points[0].stay, 0);
  assert.equal(points.at(-1).move, compare(inputs).move);
});
test('pool filter excludes LPs, missing APY, small pools and lookalike symbols', () => {
  const pool = { pool:'test-pool-id', stablecoin:true, symbol:'USDC', exposure:'single', ilRisk:'no', apy:5, tvlUsd:2e6, chain:'Ethereum', project:'test' };
  const rows = [pool, {...pool,apy:null},{...pool,symbol:'USDC-USDT'},{...pool,exposure:'multi'},{...pool,tvlUsd:1},{...pool,apy:Infinity}];
  assert.equal(normalizePools(rows).length, 1);
});
test('untrusted receipts must pass numeric and provenance validation', () => {
  assert.throws(() => validateReceipt({ version:1, name:'bad', inputs:{ ...inputs, amount:-1 } }));
  assert.throws(() => validateReceipt({ version:1, name:'bad', inputs, savedAt:100, expiresAt:200, source:{type:'oracle-verified'} }));
});
