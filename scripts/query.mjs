import { readReceipts, chain, RECEIPT_SCHEMA } from '../src/arkiv.js';
import { isAddress } from 'viem';

const address=process.argv[2];
if(!isAddress(address??'')) {
  console.error('Usage: npm run query -- 0xYOUR_WRITER_WALLET_ADDRESS');
  process.exitCode=1;
} else {
  try {
    const receipts=await readReceipts(address);
    console.log(JSON.stringify({chainId:chain.id,schema:RECEIPT_SCHEMA,owner:address,receipts},null,2));
  } catch(error) {
    console.error(error.shortMessage??error.message);
    process.exitCode=1;
  }
}
