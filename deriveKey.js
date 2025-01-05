const xrpl = require('xrpl');

// Replace this with your actual seed phrase
const seedPhrase = 'A 635793 B 068520 C 507240 D 552486 E 203560 F 071241 G 167215 H 498406';

// Derive the wallet from the seed phrase
const wallet = xrpl.Wallet.fromSeed(seedPhrase);

console.log('Public Address:', wallet.classicAddress);
console.log('Secret Key:', wallet.secret);