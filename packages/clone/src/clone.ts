import Dockerode = require("dockerode");
import { inquire } from "./args";
import { fundERC20 } from "./fund";
import { startDocker, restartContainer } from "./docker";
import { startGanache, restartGanache } from "./ganache";

const start = async (argv) => {
  console.log("start", argv);
  let ganache;

  if (argv.run && argv.run.toLowerCase() === "docker")
    ganache = await startDocker("ganache");

  if (argv.run && argv.run.toLowerCase() === "node")
    ganache = await startGanache();

  if (ganache) {
    // Run initial ERC20 token funding to initial accounts
    try {
      fundERC20();
    } catch (e) {
      console.error("Failed to seed", e);
    }

    // We need to refresh Ganache every half hour because
    // using Infura as a provider is a full node (only 128 archive blocks),
    // not a full archive node
    let refresh;
    if (argv.network === "Infura (recommended for beginners)")
      refresh = setInterval(
        async (container) => {
          let reset;
          if (argv.run && argv.run === "docker")
            reset = restartContainer(container);
          if (argv.run && argv.run === "node")
            reset = restartGanache(container);
          if (reset) {
            try {
              fundERC20();
              // TODO: re-run migrations if flagged in config file
            } catch (e) {
              console.error("Failed to seed", e);
            }
          }
        },
        100000,
        ganache
      );

    // // Cleanly exit
    process.once("SIGINT", () => {
      if (refresh) clearInterval(refresh);
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (argv.run && argv.run === "docker") {
        ganache.stop(function (err, data) {
          console.log("\n", "Removing cloned blockchain...", "\n");
          if (!ganache) return;
          ganache.remove(function (err, data) {
            process.exit();
          });
        });
      }
    });

    process.once("SIGTERM", () => {
      if (refresh) clearInterval(refresh);
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (argv.run && argv.run === "docker") {
        ganache.stop(function (err, data) {
          console.log("\n", "Removing cloned blockchain...", "\n");
          if (!ganache) return;
          ganache.remove(function (err, data) {
            process.exit();
          });
        });
      }
    });
  }
};

const main = async (argv = require("yargs").argv) => {
  console.log("argv", argv);
  await inquire(argv);
  start(argv);
};

export default main;
