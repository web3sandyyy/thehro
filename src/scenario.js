import { validateReceipt, validatePoolSnapshot, FEE_KEYS } from './math.js';

export function effectiveRate(pool, excludeRewards=false, rateMode='reported', rateHaircut=0) {
  const rate=excludeRewards&&pool.base!=null?pool.base:rateMode==='mean'&&pool.mean30d!=null?pool.mean30d:pool.apy;
  return rate*(1-rateHaircut/100);
}
export function cleanScenario(value) {
  validateReceipt(value);
  const inputs=Object.fromEntries(['amount','currentApy','targetApy','days','cost'].map(k=>[k,value.inputs[k]]));
  const source={type:value.source.type,fetchedAt:value.source.type==='defillama'?value.source.fetchedAt:null,poolId:typeof value.source.poolId==='string'?value.source.poolId:undefined,provider:value.source.type==='defillama'?'DeFiLlama':null,observationTime:null};
  const pool=value.pool?Object.fromEntries(['id','project','chain','symbol','apy','base','reward','mean30d','tvl','meta','example','manual','snapshot'].map(k=>[k,value.pool[k]])):null;
  return {version:value.version,name:value.name.trim(),inputs,source,pool,excludeRewards:value.excludeRewards===true,rateMode:value.rateMode??'reported',rateHaircut:value.rateHaircut??0,fees:value.fees?Object.fromEntries(FEE_KEYS.map(k=>[k,value.fees[k]])):null,savedAt:value.savedAt,...(value.version===1?{expiresAt:value.expiresAt}:{lifetimeMinutes:value.lifetimeMinutes})};
}
export function restoreScenario(value) {
  const receipt=cleanScenario(value);
  let pool=receipt.pool,excludeRewards=receipt.excludeRewards,rateMode=receipt.rateMode,rateHaircut=receipt.rateHaircut;
  // Never invent a breakdown for old/inconsistent metadata. Preserve the recorded rate.
  if (!pool || Math.abs(effectiveRate(pool,excludeRewards,rateMode,rateHaircut)-receipt.inputs.targetApy)>1e-8) {
    pool={id:'saved-snapshot',project:receipt.name,chain:'Saved scenario',symbol:'USDC',apy:receipt.inputs.targetApy,base:null,reward:null,mean30d:null,tvl:null,meta:'Rate breakdown unavailable for this saved snapshot.',snapshot:true,example:receipt.source.type==='example'};
    excludeRewards=false;rateMode='reported';rateHaircut=0;
  }
  validatePoolSnapshot(pool);
  const {targetApy,...inputs}=receipt.inputs;
  return {inputs,selected:pool,excludeRewards,rateMode,rateHaircut,fees:receipt.fees,restoredSource:receipt.source,selectedFetchedAt:receipt.source.fetchedAt};
}
export function parseScenario(text) {
  if(typeof text!=='string'||text.length>65536)throw new Error('Choose a scenario JSON file smaller than 64 KB.');
  try{return cleanScenario(JSON.parse(text));}catch(error){throw new Error(error instanceof SyntaxError?'This is not valid JSON.':error.message);}
}
export function encodeScenario(value) {
  const bytes=new TextEncoder().encode(JSON.stringify(cleanScenario(value)));
  return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeScenario(value) {
  if(value.length>16000)throw new Error('This scenario link is too large. Import JSON instead.');
  return parseScenario(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))));
}
