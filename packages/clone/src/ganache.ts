const Ganache = require("ganache-core");
const config = require("../config");
import { LIQUIDITY } from "./constants";

export function startGanache() {
  return new Promise((resolve, reject) => {
    const server = Ganache.server({
      fork: `https://mainnet.infura.io/v3/${config.INFURA_KEY}`,
      hostname: "0.0.0.0",
      mnemonic: config.MNEMONIC,
      blockTime: 5,
      unlocked_accounts: Object.values(LIQUIDITY),
    });

    server.listen(8545, function (err, blockchain) {
      //   console.log("\n", "b", blockchain, "\n");
      //   console.log("\n", "g", server.provider, "\n");
      //   console.log("\n", "s", server, "\n");

      // TODO: pipe output
      resolve(server);
    });
  });
}

export function restartGanache(server) {
  return new Promise(async (resolve, reject) => {
    try {
      server.stop();
      resolve(await startGanache());
    } catch (e) {
      reject(e);
    }
  });
}
