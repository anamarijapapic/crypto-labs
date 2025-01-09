/**
 * @file lab-05.js
 */

require('dotenv').config();
const Client = require('bitcoin-core');

// Autorizacijski podaci za RPC klijent.
// Promijeniti vrijednost konfiguracijskih varijabli u .env datoteci.
const client = new Client({
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT, // testnet
  username: process.env.RPC_USER,
  password: process.env.RPC_PASS,
});

async function main() {
  // *** ZADATAK 1 *** //
  // Broj transakcija u mempoolu: _____, Visina blockchaina: _____
  let mempool = [];
  try {
    mempool = await client.getRawMempool();
    console.log(`Mempool size: ${mempool.length}`);
  } catch (error) {
    console.error(error);
  }

  try {
    console.log(`Blockchain height: ${await client.getBlockCount()}`);
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 2 *** //
  // Ispišite cijeli mempool u obliku liste stringova tj. liste TX identifikatora (txid).
  console.log('Transactions:');
  console.dir(mempool, { maxArrayLength: null });

  // *** ZADATAK 3 *** //
  // Dohvatite id prve transakcije u mempoolu.
  const firstTxId = mempool[0];
  console.log(`First transaction ID: ${firstTxId}`);

  // *** ZADATAK 4 *** //
  // Dohvatite transakciju iz prethodnog zadatka u sirovom obliku.
  let firstTxRaw = '';
  try {
    firstTxRaw = await client.getRawTransaction(firstTxId, true);
    console.log('First transaction (Raw):\n', firstTxRaw);
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 5 *** //
  // Dohvatite i ispišite veličinu te transakcije (u bajtovima).
  const txSize = firstTxRaw.size;
  console.log(`First transaction size: ${txSize} bytes`);

  // *** ZADATAK 6 *** //
  // Pretvorite transakciju u heksadekadski string pa je ispišite u sirovom obliku.
  const firstTxHex = firstTxRaw.hex;
  console.log(`First transaction (Hex): ${firstTxHex}`);

  // *** ZADATAK 7 *** //
  // Dohvatite i ispišite sve izlaze iz te transakcije.
  const outputs = firstTxRaw.vout;
  console.log('First transaction outputs:');
  console.dir(outputs, { maxArrayLength: null });

  // *** ZADATAK 8 *** //
  // Dohvatite i ispišite prvi izlaz iz te transakcije.
  const firstOutput = outputs[0];
  console.log('First transaction - Output 1:\n', firstOutput);

  // *** ZADATAK 9 *** //
  // Dohvatite i ispišite iznos bitcoina koji se prenosi prvim izlazom.
  const value = firstOutput.value;
  console.log(`First transaction - Output 1 (Value): ${value} BTC`);

  // *** ZADATAK 10 *** //
  // Rezultat iz prethodnog zadatka provjerite u blockexploreru.

  // *** ZADATAK 11 *** //
  // Dohvatite i ispišite skriptu koja se nalazi u prvom izlazu te transakcije.
  const script = firstOutput.scriptPubKey;
  console.log('First transaction - Output 1 (Script):\n', script);

  // *** ZADATAK 12 *** //
  // Koji OP kodovi su korišteni u dohvaćenoj skripti?
  console.log(script.asm);

  // *** ZADATAK 13 *** //
  // Izvorni kod s Moodlea (skripte.java) rewritean u JS-u.
  // Ispisuje primjere svih skripti dostupnih u mempoolu.
  // Koji su sve tipovi skripti vidljivi?
  const scriptTypes = new Map();
  let cnt = 0;
  for (const txId of mempool) {
    console.log(`Parsing scripts from mempool transaction #${cnt++}`);
    try {
      const tx = await client.getRawTransaction(txId, true);
      for (const out of tx.vout) {
        const scr = out.scriptPubKey;
        scriptTypes.set(scr.type, scr);
      }
    } catch (error) {
      // ignore RPC errors
    }
    if (cnt >= 100) break;
  }

  console.log();
  console.log('*** POPIS SKRIPTI ***');
  for (const type of scriptTypes.keys()) {
    console.log();
    console.log(`Vrsta skripte: ${type}`);
    console.log('Detalji:', scriptTypes.get(type));
  }
}

main();

module.exports = main;
