const hdkey = require('ethereumjs-wallet').hdkey;

const seedPhrase = 'seedpharase';

// Derive HD Wallet from seed phrase
const hdwallet = hdkey.fromMasterSeed(seedPhrase);

// Derive addresses from HD Wallet
const numAddresses = 60; // specify number of addresses to derive
const addresses = [];
for (let i = 0; i < numAddresses; i++) {
  const wallet = hdwallet.deriveChild(i).getWallet();
  addresses.push(wallet.getAddressString());
}

console.log(addresses);
