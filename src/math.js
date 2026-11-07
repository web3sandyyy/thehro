export function assertInputs({ amount, currentApy, targetApy, days, cost }) {
  for (const value of [amount, currentApy, targetApy, days, cost]) {
    if (!Number.isFinite(value)) throw new Error('Enter a valid number in every field.');
  }
  if (amount < 0.01 || amount > 1e9) throw new Error('Amount must be between $0.01 and $1 billion.');
  if (currentApy < 0 || currentApy > 1000 || targetApy < 0 || targetApy > 1000) throw new Error('APYs must be between 0% and 1,000%.');
  if (days < 1 || days > 3650) throw new Error('Choose a holding period from 1 to 3,650 days.');
  if (cost < 0 || cost >= amount) throw new Error('Switching costs must be less than the amount.');
}

// APY is an effective annual rate, not APR. Deduct the all-in switching cost
// before compounding, so the opportunity cost of spending those dollars counts.
export function growth(amount, apy, days) {
  return amount * Math.expm1(Math.log1p(apy / 100) * days / 365);
}

export function compare(input) {
  assertInputs(input);
  const { amount, currentApy, targetApy, days, cost } = input;
  const stay = growth(amount, currentApy, days);
  const move = growth(amount - cost, targetApy, days) - cost;
  let breakEven = null;
  if (targetApy > currentApy) {
    breakEven = cost === 0 ? 0 : 365 * Math.log(amount / (amount - cost)) / (Math.log1p(targetApy / 100) - Math.log1p(currentApy / 100));
  } else if (cost === 0 && targetApy === currentApy) breakEven = 0;
  return { stay, move, advantage: move - stay, breakEven };
}

export function chartPoints(input, count = 41) {
  assertInputs(input);
  return Array.from({ length: count }, (_, i) => {
    const day = input.days * i / (count - 1);
    return { day, stay: growth(input.amount, input.currentApy, day), move: growth(input.amount - input.cost, input.targetApy, day) - input.cost };
  });
}

export function normalizePools(data) {
  if (!Array.isArray(data)) throw new Error('The yield provider returned an unexpected response.');
  return data.filter(p => p && typeof p.pool === 'string' && /^[a-z0-9-]{8,160}$/i.test(p.pool)
    && p.stablecoin === true && p.symbol === 'USDC' && p.exposure === 'single'
    && p.ilRisk === 'no' && Number.isFinite(p.apy) && p.apy >= 0 && p.apy <= 1000
    && Number.isFinite(p.tvlUsd) && p.tvlUsd >= 1_000_000
    && typeof p.chain === 'string' && typeof p.project === 'string')
    .map(p => ({ id: p.pool, project: p.project.slice(0,100), chain: p.chain.slice(0,80), symbol: p.symbol,
      apy: p.apy, base: validRate(p.apyBase) ? p.apyBase : null,
      reward: validRate(p.apyReward) ? p.apyReward : null,
      tvl: p.tvlUsd, mean30d: validRate(p.apyMean30d) ? p.apyMean30d : null,
      meta: typeof p.poolMeta === 'string' ? p.poolMeta.slice(0,200) : '' }))
    .sort((a,b) => b.tvl - a.tvl);
}

export function validateReceipt(value) {
  if (!value || ![1,2].includes(value.version) || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 100 || new TextEncoder().encode(value.name).length > 128) throw new Error('Receipt names must be nonempty and at most 128 UTF-8 bytes.');
  if (!value.inputs || typeof value.inputs !== 'object') throw new Error('Missing comparison inputs.');
  assertInputs(value.inputs);
  if (!validTimestamp(value.savedAt)) throw new Error('Invalid scenario timestamp.');
  if (value.version===1 && (!validTimestamp(value.expiresAt) || value.expiresAt <= value.savedAt)) throw new Error('Invalid receipt lifetime.');
  if (value.version===2 && !LIFETIMES.includes(value.lifetimeMinutes)) throw new Error('Invalid receipt lifetime.');
  if (!['manual', 'example', 'defillama'].includes(value.source?.type)) throw new Error('Invalid data source.');
  if (value.source.type === 'defillama' && (!validTimestamp(value.source.fetchedAt) || !validPoolId(value.source.poolId))) throw new Error('Missing market provenance.');
  if (value.rateHaircut !== undefined && (!Number.isFinite(value.rateHaircut) || value.rateHaircut < 0 || value.rateHaircut > 100)) throw new Error('Rate reduction must be between 0 and 100%.');
  if (value.rateMode !== undefined && !['reported','mean'].includes(value.rateMode)) throw new Error('Invalid rate mode.');
  if (value.excludeRewards !== undefined && typeof value.excludeRewards !== 'boolean') throw new Error('Invalid reward setting.');
  if (value.pool) validatePoolSnapshot(value.pool);
  if (value.version===2 && !value.pool) throw new Error('Missing pool snapshot.');
  if (value.fees != null) {
    if (FEE_KEYS.some(k=>!Number.isFinite(value.fees[k]) || value.fees[k]<0)) throw new Error('Invalid fee breakdown.');
    if (Math.abs(FEE_KEYS.reduce((n,k)=>n+value.fees[k],0)-value.inputs.cost)>1e-6) throw new Error('Fee breakdown does not match total cost.');
  }
  if (new TextEncoder().encode(JSON.stringify(value)).length>65536) throw new Error('Scenario exceeds the 64 KB limit.');
  return value;
}

export const LIFETIMES=[2,15,30,60,1440,10080];
export const FEE_KEYS=['withdrawal','gas','bridge','entry','slippage'];
export const validRate=value=>Number.isFinite(value)&&value>=0&&value<=1000;
export const validTimestamp=value=>Number.isSafeInteger(value)&&value>0&&value<=8640000000000000;
export const validPoolId=value=>typeof value==='string'&&/^[a-z0-9-]{8,160}$/i.test(value);
export const outcome=advantage=>Math.abs(advantage)<0.005?'tie':advantage>0?'move':'stay';
export function validatePoolSnapshot(pool) {
  if (!pool || !validPoolId(pool.id) || typeof pool.project!=='string' || !pool.project.trim() || pool.project.length>100 || typeof pool.chain!=='string' || pool.chain.length>80 || pool.symbol!=='USDC' || !validRate(pool.apy)) throw new Error('Invalid pool snapshot.');
  for (const k of ['base','reward','mean30d']) if (pool[k]!=null&&!validRate(pool[k])) throw new Error('Invalid pool rate breakdown.');
  if (pool.meta!=null&&(typeof pool.meta!=='string'||pool.meta.length>200)) throw new Error('Invalid pool description.');
  return pool;
}
