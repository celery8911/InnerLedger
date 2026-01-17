require('dotenv').config({ path: '.env.local' });
const { ethers } = require('ethers');

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error('PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

const wallet = new ethers.Wallet(privateKey);
console.log('Address:', wallet.address);
console.log('Please fund this address with Monad testnet tokens');
