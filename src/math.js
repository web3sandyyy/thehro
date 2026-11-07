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

export const validRate=value=>Number.isFinite(value)&&value>=0&&value<=1000;
export const outcome=advantage=>Math.abs(advantage)<0.005?'tie':advantage>0?'move':'stay';
