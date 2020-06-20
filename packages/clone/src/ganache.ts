const Ganache = require("ganache-core");
import { LIQUIDITY } from "./constants";

export function startGanache(argv): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const server = Ganache.server({
        fork: argv.url,
        hostname: "0.0.0.0",
        mnemonic: argv.mnemonic && argv.mnemonic,
        //   gasPrice: "0",
        //   blockTime: 5,
        unlocked_accounts: Object.values(LIQUIDITY),
      });

      server.listen(8545, function (err, blockchain) {
        if (err)
          reject(
            `Could not start a clone of mainnet\n${err}\nIs the HTTP endpoint correct? ${argv.url}`
          );
        resolve(server);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function restartGanache(server, argv): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      server.stop();
      const newServer = await startGanache(argv);
      resolve(newServer);
    } catch (e) {
      reject(e);
    }
  });
}
