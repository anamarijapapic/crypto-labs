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
  // Prebrojite izlaze u transakciji [01 :: ba5f26].
  // 01 (txid) ba5f2650a46db9c7ac6521d0f121125b7ea04603d4b7e47da2c7d836c3aea491
  // Koliko ih ima? => Rezultat: 13
  // Koji izlaz ima najveću vrijednost (napišite iznos)? => Rezultat: 146.91532463 BTC
  try {
    const txid =
      'ba5f2650a46db9c7ac6521d0f121125b7ea04603d4b7e47da2c7d836c3aea491';
    const tx = await client.getRawTransaction(txid, true);
    // console.log(tx);
    console.log(
      `Transakcija [${tx.txid.slice(0, 6)}] ima ${tx.vout.length} izlaza.`
    );

    let max = 0;
    for (const vout of tx.vout) {
      if (vout.value > max) {
        max = vout.value;
      }
    }
    console.log(`Najveći iznos iznosi: ${max} BTC`);
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 2 *** //
  // Kojom transakcijom u bloku 123123 je preneseno najviše bitcoina
  // (najveća zbrojena vrijednost svih izlaza neke tx)?
  // Upišite prva 4 znaka txid-a.
  // Rezultat: 0bde300106882ff2b98081419aa7465a64c00fbc4c2d573bf6593da8dc4cb489 => 175815.27 BTC
  const blockHeight = 123123;
  let block = {};
  try {
    const blockHash = await client.getBlockHash(blockHeight);
    // console.log(`Hash bloka ${blockHeight}: ${blockHash}`);
    block = await client.getBlock(blockHash);
    // console.log(block);
    let maxSum = 0;
    let maxSumTx = '';
    for (const txid of block.tx) {
      try {
        let totalSum = 0;
        const tx = await client.getRawTransaction(txid, true);
        // console.log(tx.txid, tx.vout);

        for (const vout of tx.vout) {
          totalSum = parseFloat((totalSum + vout.value).toFixed(8));
        }

        if (totalSum > maxSum) {
          maxSum = totalSum;
          maxSumTx = tx.txid;
        }
      } catch (error) {
        console.error(error);
      }
    }
    console.log(`Transakcija [${maxSumTx.slice(0, 4)}] => ${maxSum} BTC`);
  } catch (error) {
    console.error(error);
  }
  // *** ZADATAK 3 *** //
  // Kolika je naknada (engl. fee) u transakciji [02 :: 737306]?
  // Rezultat: 0.0000294 BTC
  try {
    const txid =
      '737306ee4bc405b23bd236e0cf6c847d870fe56a21ca0a1e9fc70481c9ab3cfa';
    const tx = await client.getRawTransaction(txid, true);
    // console.log(tx);

    let totalInput = 0;
    for (const vin of tx.vin) {
      const inputTx = await client.getRawTransaction(vin.txid, true);
      const inputVout = inputTx.vout[vin.vout];
      totalInput = parseFloat((totalInput + inputVout.value).toFixed(8));
    }

    let totalOutput = 0;
    for (const vout of tx.vout) {
      totalOutput = parseFloat((totalOutput + vout.value).toFixed(8));
    }

    const fee = parseFloat((totalInput - totalOutput).toFixed(8));
    console.log(`Naknada u transakciji [${txid.slice(0, 4)}]: ${fee} BTC`);
  } catch (error) {
    console.error(error);
  }
}

main();

module.exports = main;
