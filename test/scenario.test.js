import test from 'node:test';
import assert from 'node:assert/strict';
import { examples, filterPools, manualPool, poolLink, poolWarnings } from '../src/data.js';
import { effectiveRate, cleanScenario, restoreScenario, parseScenario, encodeScenario, decodeScenario } from '../src/scenario.js';
import { readDraft, writeDraft, clearDraft, DRAFT_KEY } from '../src/storage.js';
import { compare } from '../src/math.js';

const boosted = examples[1];
const scenario = (patch={}) => ({ version:2, name:'Boosted · 90 days', inputs:{amount:5000,currentApy:4.2,targetApy:7.8,days:90,cost:18},
  source:{type:'example',fetchedAt:null,poolId:boosted.id}, pool:{...boosted}, excludeRewards:false, rateMode:'reported', rateHaircut:0,
  fees:null, savedAt:1_800_000_000_000, lifetimeMinutes:30, ...patch });

test('reopening a receipt keeps the saved base/reward breakdown and reward mode', () => {
  const restored = restoreScenario(scenario());
  assert.equal(restored.selected.base, 4.9);
  assert.equal(restored.selected.reward, 2.9);
  assert.equal(restored.excludeRewards, false);
  const excluded = restoreScenario(scenario({ excludeRewards:true, inputs:{...scenario().inputs,targetApy:4.9} }));
  assert.equal(excluded.excludeRewards, true);
  assert.equal(effectiveRate(excluded.selected, excluded.excludeRewards), 4.9);
});

test('legacy or inconsistent receipts become an explicit snapshot, never a 0% reward', () => {
  const legacy = { version:1, name:'Old', inputs:scenario().inputs, source:{type:'example'}, savedAt:1, expiresAt:2 };
  const restored = restoreScenario(legacy);
  assert.equal(restored.selected.snapshot, true);
  assert.equal(restored.selected.apy, 7.8);
  assert.equal(restored.selected.reward, null);
  assert.equal(restored.selected.base, null);
});

test('restored scenarios reproduce the original comparison exactly', () => {
  const s = scenario({ rateMode:'reported', rateHaircut:25, inputs:{...scenario().inputs,targetApy:7.8*0.75} });
  const r = restoreScenario(s);
  const again = compare({...r.inputs,targetApy:effectiveRate(r.selected,r.excludeRewards,r.rateMode,r.rateHaircut)});
  assert.equal(again.advantage, compare(s.inputs).advantage);
});

test('itemized fees must add up to the total cost', () => {
  assert.doesNotThrow(() => cleanScenario(scenario({ fees:{withdrawal:3,gas:5,bridge:0,entry:4,slippage:6} })));
  assert.throws(() => cleanScenario(scenario({ fees:{withdrawal:3,gas:5,bridge:0,entry:4,slippage:1} })), /does not match/);
});

test('manual target pools validate and support the reward stress test', () => {
  const pool = manualPool(5, 2);
  const s = cleanScenario(scenario({ source:{type:'manual',poolId:pool.id}, pool, inputs:{...scenario().inputs,targetApy:7} }));
  const r = restoreScenario(s);
  assert.equal(r.selected.manual, true);
  assert.equal(effectiveRate(r.selected, true), 5);
  assert.equal(poolLink(pool), null);
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

test('share links and JSON imports round-trip and reject tampering', () => {
  const s = cleanScenario(scenario());
  assert.deepEqual(decodeScenario(encodeScenario(s)), s);
  assert.throws(() => parseScenario('{not json'), /not valid JSON/);
  assert.throws(() => parseScenario(JSON.stringify({...s, inputs:{...s.inputs, cost:99999}})));
});

test('drafts persist locally and ignore corrupt storage', () => {
  const store = new Map();
  const storage = { getItem:k=>store.get(k)??null, setItem:(k,v)=>store.set(k,v), removeItem:k=>store.delete(k) };
  writeDraft(storage, scenario());
  assert.equal(readDraft(storage).pool.reward, 2.9);
  store.set(DRAFT_KEY, '{"version":2');
  assert.equal(readDraft(storage), null);
  clearDraft(storage);
  assert.equal(store.has(DRAFT_KEY), false);
});
