/**
 * @file lab-06.js
 */

require('dotenv').config();
const Client = require('bitcoin-core');
const readline = require('node:readline');

// *** ZADATAK 1 *** //
// Pripremite razvojno sučelje za pristup RPC API.

// Setup the client
const client = new Client({
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT, // testnet
  username: process.env.RPC_USER,
  password: process.env.RPC_PASS,
});

async function main() {
  // *** ZADATAK 2 *** //
  // Dohvatite neki proizvoljni podatak s poslužitelja.
  try {
    const info = await client.getBlockchainInfo();
    console.log(info);
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 3 *** //
  // Napišite program koji od korisnika traži unos visine bloka nakon čega prebroji transakcije koje se nalaze u tom bloku.
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // (testnet) Blok #67895 -> 7 transakcija
  rl.question(`Unesite visinu bloka: `, async (blockHeight) => {
    rl.close();

    let blockHash = '';
    try {
      const blockStats = await client.getBlockStats(Number(blockHeight));
      console.log(blockStats);
      blockHash = blockStats.blockhash;
      console.log(`Broj transakcija u bloku: ${blockStats.txs}`);
    } catch (error) {
      console.error(error);
    }

    // O kojim transakcijama je riječ?
    try {
      const block = await client.getBlock(blockHash);
      console.log('Transakcije:\n', block.tx);
    } catch (error) {
      console.error(error);
    }
  });
}

main();

module.exports = main;
