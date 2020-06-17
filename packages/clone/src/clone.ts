import { promptMissingArgs } from "./args";
import { fundERC20 } from "./fund";
import { startDocker, restartContainer } from "./docker";
import { startGanache, restartGanache } from "./ganache";
import { getConfig, loadConfig } from "./config";
import { migrate } from "./deploy";
import yargs = require("yargs");

const start = async (argv) => {
  console.log("start", argv);
  let ganache;

  if (argv.run && argv.run.toLowerCase() === "docker")
    ganache = await startDocker("ganache", argv);

  if (argv.run && argv.run.toLowerCase() === "node")
    ganache = await startGanache(argv);

  if (ganache) {
    // Run initial ERC20 token funding to initial accounts
    const config = await getConfig("cwa-config.js");

    const load = await loadConfig(config);
    console.log(config, load);

    try {
      await migrate();
      await fundERC20();
    } catch (e) {
      console.error("Failed to seed", e);
    }

    // We need to refresh Ganache every half hour if
    // using a full node (only 128 archive blocks)

    let refresh;
    if (argv.node === "full")
      refresh = setInterval(
        async (container) => {
          let reset;
          if (argv.run && argv.run === "docker")
            reset = restartContainer(container);
          if (argv.run && argv.run === "node")
            reset = restartGanache(container, argv);
          if (reset) {
            try {
              await migrate();
              await fundERC20();
            } catch (e) {
              console.error("Failed to seed", e);
            }
          }
        },
        30 * 60 * 1000,
        ganache
      );

    // // Cleanly exit
    process.once("SIGINT", () => {
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (refresh) clearInterval(refresh);
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
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (refresh) clearInterval(refresh);
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

const main = async (argv = yargs.argv) => {
  await promptMissingArgs(argv);
  start(argv);
};

export default main;
