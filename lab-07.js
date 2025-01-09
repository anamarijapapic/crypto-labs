/**
 * @file lab-07.js
 */

require('dotenv').config();
const Client = require('bitcoin-core');

// Setup the client
const client = new Client({
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT, // mainnet
  username: process.env.RPC_USER,
  password: process.env.RPC_PASS,
});

async function main() {
  // *** ZADATAK 1 *** //
  // Koliko izlaza ima transakcija [01 :: ba5f26]?
  // 01 (txid) ba5f2650a46db9c7ac6521d0f121125b7ea04603d4b7e47da2c7d836c3aea491
  // Rezultat: 13
  try {
    const txid =
      'ba5f2650a46db9c7ac6521d0f121125b7ea04603d4b7e47da2c7d836c3aea491';
    const tx = await client.getRawTransaction(txid, true);
    // console.log(tx);
    console.log(
      `Transakcija [${tx.txid.slice(0, 6)}] ima ${tx.vout.length} izlaza.`
    );
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 2 *** //
  // Koliko transakcija se nalazi u bloku 123123?
  // Rezultat: 21
  const blockHeight = 123123;
  let block = {};
  try {
    const blockHash = await client.getBlockHash(blockHeight);
    // console.log(`Hash bloka ${blockHeight}: ${blockHash}`);
    block = await client.getBlock(blockHash);
    // console.log(block);
    console.log(`Broj transakcija u bloku ${blockHeight}: ${block.nTx}`);
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 3 *** //
  // Kojom transakcijom u bloku 123123 je prenseno najviše bitcoina (najveća zbrojena vrijednost svih izlaza neke tx)?
  // Rezultat: 0bde300106882ff2b98081419aa7465a64c00fbc4c2d573bf6593da8dc4cb489 => 175815.27 BTC
  let maxSum = 0;
  let maxSumTx = '';
  for (const txid of block.tx) {
    try {
      let totalSum = 0;
      const tx = await client.getRawTransaction(txid, true);
      // console.log(tx.txid, tx.vout);
      totalSum = tx.vout.reduce(
        (sum, vout) => parseFloat((sum + vout.value).toFixed(8)),
        0
      );
      console.log(
        `Suma izlaza transakcije [${tx.txid.slice(0, 4)}]: ${totalSum}`
      );
      if (totalSum > maxSum) {
        maxSum = totalSum;
        maxSumTx = tx.txid;
      }
    } catch (error) {
      console.error(error);
    }
  }
  console.log(
    `Transakcija kojom je preneseno najviše bitcoina: [${maxSumTx.slice(
      0,
      4
    )}] => ${maxSum} BTC`
  );

  // *** ZADATAK 4 *** //
  // Kolika je naknada (engl. fee) u transakciji [02 :: 737306]?
  // 02 (txid) 737306ee4bc405b23bd236e0cf6c847d870fe56a21ca0a1e9fc70481c9ab3cfa
  // Rezultat: 0.00002940 BTC
  try {
    const txid =
      '737306ee4bc405b23bd236e0cf6c847d870fe56a21ca0a1e9fc70481c9ab3cfa';
    const tx = await client.getRawTransaction(txid, true);
    // console.log(tx);

    let totalInput = 0;
    for (const vin of tx.vin) {
      const prevTx = await client.getRawTransaction(vin.txid, true);
      totalInput = parseFloat(
        (totalInput + prevTx.vout[vin.vout].value).toFixed(8)
      );
    }
    // console.log(`Ukupni ulaz: ${totalInput.toFixed(8)} BTC`);

    const totalOutput = tx.vout.reduce(
      (sum, vout) => parseFloat((sum + vout.value).toFixed(8)),
      0
    );
    // console.log(`Ukupni izlaz: ${totalOutput.toFixed(8)} BTC`);

    const fee = parseFloat((totalInput - totalOutput).toFixed(8));
    console.log(`Naknada u transakciji [${tx.txid.slice(0, 6)}]: ${fee} BTC`);
  } catch (error) {
    console.error(error);
  }
}

main();
