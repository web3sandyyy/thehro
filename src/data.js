import { normalizePools } from './math.js';

export const examples = [
  { id:'example-steady', project:'Steady vault', chain:'Example', symbol:'USDC', apy:5.5, base:5.5, reward:0, tvl:null, mean30d:null, example:true },
  { id:'example-boosted', project:'Boosted vault', chain:'Example', symbol:'USDC', apy:7.8, base:4.9, reward:2.9, tvl:null, mean30d:null, example:true },
  { id:'example-incentive', project:'Incentive vault', chain:'Example', symbol:'USDC', apy:12.4, base:3.6, reward:8.8, tvl:null, mean30d:null, example:true },
];
let cached;
export async function fetchPools({force=false}={}) {
  if(!force&&cached&&Date.now()-cached.fetchedAt<300000)return cached;
  const response = await fetch('https://yields.llama.fi/pools', { signal:AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`Yield provider returned HTTP ${response.status}.`);
  const json = await response.json();
  const pools = normalizePools(json.data);
  if (!pools.length) throw new Error('No matching single-asset USDC pools are available.');
  cached={ pools, fetchedAt:Date.now() };return cached;
}
export function filterPools(pools,{search='',chain='All networks',sort='tvl'}={}) {
  const normalized=value=>value.toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim();
  const query=normalized(search);
  return pools.filter(p=>(chain==='All networks'||p.chain===chain)&&normalized(`${p.project} ${prettyProject(p.project)} ${p.chain} ${p.meta??''}`).includes(query))
    .sort((a,b)=>sort==='apy'?b.apy-a.apy:sort==='base'?(b.base??-1)-(a.base??-1):sort==='name'?prettyProject(a.project).localeCompare(prettyProject(b.project)):b.tvl-a.tvl);
}
export function manualPool(base=6, reward=0) {
  return { id:'manual-target', project:'Manual target', chain:'Your estimate', symbol:'USDC', apy:base+reward, base, reward, mean30d:null, tvl:null, meta:'', manual:true };
}
export function poolLink(pool) {
  return pool.example||pool.manual||pool.snapshot?null:`https://defillama.com/yields/pool/${encodeURIComponent(pool.id)}`;
}
const RESTRICTED=/lock|vest|kyc|accredit|qualified|whitelist|permission|institution|fund|non-us|tranche/i;
export function poolWarnings(pool) {
  const warnings=[];
  if(pool.meta&&RESTRICTED.test(pool.meta))warnings.push(`“${pool.meta}” may mean lockups or eligibility limits.`);
  if(pool.reward>0&&pool.apy>0&&pool.reward/pool.apy>=0.5)warnings.push('Most of this yield is reward incentives, which can end or change.');
  if(pool.mean30d!=null&&pool.apy>0&&Math.abs(pool.apy-pool.mean30d)/Math.max(pool.mean30d,0.01)>0.5)warnings.push(`Today’s rate is far from its 30-day mean (${pool.mean30d.toFixed(2)}%).`);
  return warnings;
}
export function prettyProject(slug) {
  const names = { 'aave-v3':'Aave V3', 'aave-v4':'Aave V4', 'morpho-blue':'Morpho', 'compound-v3':'Compound V3', 'fluid-lending':'Fluid', 'moonwell':'Moonwell', 'spark':'Spark' };
  return names[slug] ?? slug.replace(/(^|-)(\w)/g,(_,sep,char)=>(sep?' ':'')+char.toUpperCase());
}
