import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, growth, chartPoints, normalizePools } from '../src/math.js';
import { filterPools, poolWarnings } from '../src/data.js';
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
test('search matches displayed protocol names, slugs and surrounding whitespace', () => {
  const pools = [
    { id:'a', project:'aave-v3', chain:'Base', apy:5, tvl:3, meta:'' },
    { id:'b', project:'compound-v3', chain:'Ethereum', apy:6, tvl:2, meta:'' },
    { id:'c', project:'fluid-lite', chain:'Ethereum', apy:7, tvl:1, meta:'' },
  ];
  for (const [query, id] of [['Aave V3','a'],['aave-v3','a'],['  aave v3  ','a'],['Compound V3','b'],['Fluid Lite','c'],['fluid_lite','c']])
    assert.deepEqual(filterPools(pools,{search:query}).map(p=>p.id), [id], query);
  assert.deepEqual(filterPools(pools,{sort:'apy'}).map(p=>p.id), ['c','b','a']);
});
test('pool warnings flag restrictions, reward-heavy yields and unstable rates', () => {
  assert.equal(poolWarnings({ meta:'30-day lock', apy:5, reward:0, mean30d:5 }).length, 1);
  assert.equal(poolWarnings({ meta:'', apy:10, reward:8, mean30d:10 }).length, 1);
  assert.equal(poolWarnings({ meta:'', apy:12, reward:0, mean30d:4 }).length, 1);
  assert.equal(poolWarnings({ meta:'', apy:5, reward:0, mean30d:5 }).length, 0);
});
