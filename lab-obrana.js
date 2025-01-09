/**
 * @file lab-obrana.js
 */

require('dotenv').config();
const Client = require('bitcoin-core');
const readline = require('node:readline');

// Setup the client
const client = new Client({
  host: process.env.RPC_HOST,
  port: process.env.RPC_PORT, // mainnet
  username: process.env.RPC_USER,
  password: process.env.RPC_PASS,
});

async function main() {
  // *** ZADATAK 1 *** //
  // Izračunajte prosječnu naknadu u bloku na visini 199991.
  // Iz izračuna se treba isključiti coinbase transakcija (prva transakcija u bloku).
  // [4/10]
  // Rezultat: 47799 satoshi (0.00047799 BTC)
  const blockHeight = 199991;
  try {
    const blockStats = await client.getBlockStats(blockHeight);
    const blockHash = blockStats.blockhash;
    // console.log(blockHash);
    console.log(
      `Prosječna naknada u bloku na visini ${blockHeight}: ${blockStats.avgfee} satoshi`
    );

    // Rješenje bez korištenja avgfee, manualno računanje
    const block = await client.getBlock(blockHash, true);
    // console.log(block);

    let avgFee = 0;
    let totalFee = 0;
    for (let i = 1; i < block.tx.length; i++) {
      const txId = block.tx[i];
      const tx = await client.getRawTransaction(txId, true);
      // console.log(tx);

      let totalOutput = 0;
      for (const vout of tx.vout) {
        totalOutput = parseFloat((totalOutput + vout.value).toFixed(8));
      }
      // console.log(totalOutput);

      let totalInput = 0;
      for (const vin of tx.vin) {
        const prevTx = await client.getRawTransaction(vin.txid, true);
        // console.log(prevTx);
        totalInput = parseFloat(
          (totalInput + prevTx.vout[vin.vout].value).toFixed(8)
        );
      }
      // console.log(totalInput);

      const fee = parseFloat((totalInput - totalOutput).toFixed(8));
      // console.log(fee);
      totalFee = parseFloat((totalFee + fee).toFixed(8));
      // console.log(totalFee);
    }

    avgFee = parseFloat((totalFee / (block.tx.length - 1)).toFixed(8));
    console.log(
      `Prosječna naknada u bloku na visini ${blockHeight}: ${avgFee} BTC`
    );
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 2 *** //
  // Za transakciju [10 :: 6847c2] pronađite koji izlaz ima najveću vrijednost.
  // * Napišite redni broj tog izlaza. [1/10]
  // * Napišite taj iznos u BTC. [2/10]
  // 10 (txid) 6847c227818e43f46aacf786dd89caff217757cd2d2270677edc8c93743b764a
  // Rezultat: Redni broj: 53 => Iznos: 0.43026112 BTC
  const txId =
    '6847c227818e43f46aacf786dd89caff217757cd2d2270677edc8c93743b764a';
  try {
    const tx = await client.getRawTransaction(txId, true);
    // console.log(tx);

    let maxVout = 0;
    let maxIndex = 0;
    for (const vout of tx.vout) {
      // console.log(vout.value);
      if (vout.value > maxVout) {
        maxVout = vout.value;
        maxIndex = vout.n;
      }
    }

    console.log(
      `U transakciji [${txId.slice(
        0,
        6
      )}] izlaz sa najvećim iznosom je redni broj: ${maxIndex} => iznos: ${maxVout} BTC`
    );
  } catch (error) {
    console.error(error);
  }

  // *** ZADATAK 3 *** //
  // Napišite program koji od korisnika traži unos visine početnog i završnog bloka
  // nakon čega ispisuje tablicu sa sljedećim podacima:
  // blok (visina bloka), hash, veličina bloka u bajtovima, broj transakcija u bloku.
  // [3/10]
  // Rezultat (primjer):
  // Unos: 199991 199999
  // Ispis:
  // ┌─────────┬───────────────┬────────────────────────────────────────────────────────────────────┬──────────────────────────┬──────────────────┐
  // │ (index) │ Blok (visina) │ Hash                                                               │ Veličina bloka (bajtovi) │ Broj transakcija │
  // ├─────────┼───────────────┼────────────────────────────────────────────────────────────────────┼──────────────────────────┼──────────────────┤
  // │ 0       │ 199991        │ '00000000000003e4ee39220994dfa2e0f83428196ee2d3565ef4834ce3943383' │ 32608                    │ 91               │
  // │ 1       │ 199992        │ '0000000000000255f8f7dab3346c395127dceacdb685868c615cefe4a7557ccc' │ 14785                    │ 49               │
  // │ 2       │ 199993        │ '00000000000000e1508de5ee2d86d9d8f59aab0515a72f9dccf88085cd105046' │ 197407                   │ 212              │
  // │ 3       │ 199994        │ '0000000000000553828611e5ead40e4d153f09557573bf89dc637b9880859789' │ 85762                    │ 94               │
  // │ 4       │ 199995        │ '000000000000008b5cc7149815a72ee057dcbf8926e788b49b97504853104398' │ 166383                   │ 236              │
  // │ 5       │ 199996        │ '000000000000044b1b5e161f64cc16ee6d5b9f4b795cd44feea6670288e7b738' │ 10069                    │ 20               │
  // │ 6       │ 199997        │ '0000000000000198a3a2b31b05409b20011a60800183a629814f73453b8a6ba8' │ 51533                    │ 169              │
  // │ 7       │ 199998        │ '000000000000017a86f33937e38281248ed65512f390bf175b60a50f321c85bf' │ 248950                   │ 124              │
  // │ 8       │ 199999        │ '00000000000003a20def7a05a77361b9657ff954b2f2080e135ea6f5970da215' │ 215288                   │ 239              │
  // └─────────┴───────────────┴────────────────────────────────────────────────────────────────────┴──────────────────────────┴──────────────────┘
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`Unesite visinu početnog i završnog bloka: `, async (input) => {
    let [startBlockHeight, endBlockHeight] = input.split(' ');
    startBlockHeight = parseInt(startBlockHeight);
    endBlockHeight = parseInt(endBlockHeight);

    try {
      let data = [];
      for (let i = startBlockHeight; i <= endBlockHeight; i++) {
        const block = await client.getBlockStats(i);
        data.push({
          'Blok (visina)': block.height,
          Hash: block.blockhash,
          'Veličina bloka (bajtovi)': block.total_size,
          'Broj transakcija': block.txs,
        });
      }
      console.table(data);
    } catch (error) {
      console.error(error);
    }
    rl.close();
  });
}

main();

module.exports = main;
