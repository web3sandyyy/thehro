import { createPublicClient, createWalletClient, ExpirationTime } from '@arkiv-network/sdk';
import { rabdi } from '@arkiv-network/sdk/chains';
import { defineSchema, str, bytes, u64 } from '@arkiv-network/sdk/schema';
import { desc } from '@arkiv-network/sdk/query';
import { http, custom, stringToBytes, hexToString, isAddress } from 'viem';
import { LIFETIMES } from './math.js';
import { cleanScenario } from './scenario.js';

export const RECEIPT_SCHEMA = 'stayput.mumbai2026.receipts.v1';
export const Receipts = defineSchema(RECEIPT_SCHEMA, {
  name: str(),
  source: str().indexed(),
  savedAt: u64().indexed(),
  receipt: bytes(),
});
export const chain = rabdi({ accessKey: import.meta.env?.VITE_ARKIV_ACCESS_KEY ?? processEnv('ARKIV_ACCESS_KEY') });
function processEnv(name) { return typeof process !== 'undefined' ? process.env[name] ?? '' : ''; }
export const publicClient = createPublicClient({ chain, transport: http(undefined, { timeout: 15000, retryCount: 1 }) });
export const explorer = chain.blockExplorers.default.url;

export async function connectWallet(provider) {
  if (!provider) throw new Error('Open Thehro in a browser with an Ethereum wallet extension to connect. You can use the calculator without one.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  if (!isAddress(accounts?.[0])) throw new Error('The wallet did not return a valid account.');
  return accounts[0];
}

async function wallet(provider, address) {
  if (!provider || !isAddress(address)) throw new Error('Connect your wallet first.');
  const accounts = await provider.request({ method: 'eth_accounts' });
  if (accounts?.[0]?.toLowerCase() !== address.toLowerCase()) throw new Error('Your wallet account changed. Reconnect and try again.');
  const chainId = `0x${chain.id.toString(16)}`;
  try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] }); }
  catch (error) {
    if (error.code !== 4902) throw error;
    await provider.request({ method: 'wallet_addEthereumChain', params: [{ chainId, chainName: 'Arkiv Rabdi Testnet',
      nativeCurrency: chain.nativeCurrency, rpcUrls: chain.rpcUrls.default.http, blockExplorerUrls: [explorer] }] });
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
  }
  if (String(await provider.request({ method:'eth_chainId' })).toLowerCase() !== chainId.toLowerCase()) throw new Error('Select Arkiv Rabdi in your wallet and try again.');
  const latestAccounts=await provider.request({method:'eth_accounts'});
  if(latestAccounts?.[0]?.toLowerCase()!==address.toLowerCase())throw new Error('Your wallet account changed. Reconnect and try again.');
  return createWalletClient({ chain, account:address, transport: custom(provider) });
}

export async function saveReceipt(provider, address, receipt, minutes) {
  receipt=cleanScenario(receipt);
  if (!LIFETIMES.includes(minutes)) throw new Error('Choose a supported receipt lifetime.');
  const client = await wallet(provider, address);
  return client.createEntity(Receipts, {
    name: receipt.name, source: receipt.source.type, savedAt: u64(BigInt(receipt.savedAt)),
    receipt: stringToBytes(JSON.stringify(receipt)),
  }, { expiration: ExpirationTime.fromMinutes(minutes), flags: { readonly: true } });
}

export async function readReceipts(address) {
  return (await readReceiptPage(address)).receipts;
}

export async function readReceiptPage(address,{offset=0,limit=24,client=publicClient}={}) {
  if (!isAddress(address)) throw new Error('Enter a valid Ethereum address.');
  if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>100)throw new Error('Invalid receipt page.');
  const [{ entities },timing] = await Promise.all([
    client.select({ $key:true, $owner:true, $expiresAt:true, name:true, source:true, savedAt:true, receipt:true })
      .from(Receipts).ownedBy(address).orderBy(desc('savedAt')).limit(limit).offset(offset).fetch(),
    client.getBlockTiming().catch(()=>null),
  ]);
  let skipped=0;
  const receipts=entities.flatMap(entity => {
    try {
      const receipt = cleanScenario(JSON.parse(hexToString(entity.receipt.value)));
      if(entity.name.value!==receipt.name||entity.source.value!==receipt.source.type||BigInt(entity.savedAt.value)!==BigInt(receipt.savedAt))throw new Error('Receipt attributes disagree.');
      if(timing&&BigInt(entity.$expiresAt)<=timing.currentBlock)return [];
      const estimatedExpiresAt=timing&&Number.isFinite(timing.blockDuration)&&timing.blockDuration>0
        ? (timing.currentBlockTime+Number(BigInt(entity.$expiresAt)-timing.currentBlock)*timing.blockDuration)*1000:null;
      // Query/chain state is authoritative. Legacy JSON expiresAt is never a visibility cutoff.
      return [{ ...receipt, key:entity.$key, owner:entity.$owner, expiresAtBlock:String(entity.$expiresAt),estimatedExpiresAt }];
    } catch { skipped++;return []; }
  });
  return {receipts,hasMore:entities.length===limit,nextOffset:offset+entities.length,skipped};
}

export async function removeReceipt(provider, address, key) {
  if (!/^0x[0-9a-f]{64}$/i.test(key)) throw new Error('Invalid entity key.');
  return (await wallet(provider,address)).deleteEntity({entityKey:key});
}
