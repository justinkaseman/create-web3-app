import { promptMissingArgs } from "./args";
import { startDocker, restartContainer } from "./docker";
import { startGanache, restartGanache } from "./ganache";
import { getConfig, loadConfig } from "./config";
import { migrate } from "./deploy";
import { logError } from "./logger";
import yargs = require("yargs");

const start = async (argv) => {
  // Start the local ganache instance
  let ganache;
  if (argv.run && argv.run === "docker")
    ganache = await startDocker("ganache", argv);
  if (argv.run && argv.run === "process") ganache = await startGanache(argv);

  if (ganache) {
    migrate().then(() => {
      console.log(
        "Your clone of mainnet is ready to be used at http://localhost:8545 🚀"
      );
    });

    // If using a full node
    // We need to refresh Ganache every half hour (only 128 archive blocks)
    let interval;
    if (argv.node && argv.node === "full")
      interval = setInterval(async () => {
        console.log("Reloading full node:\n");
        let reset;
        if (argv.run && argv.run === "docker")
          reset = await restartContainer(ganache);
        if (argv.run && argv.run === "process")
          reset = await restartGanache(ganache, argv);
        if (reset) {
          ganache = reset;
          try {
            await migrate();
          } catch (e) {
            throw new Error(`Failed to seed while refreshing\n${e}`);
          }
        }
      }, 30 * 60 * 1000);

    // // Cleanly exit
    process.once("SIGINT", () => {
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (interval) clearInterval(interval);
      if (argv.run && argv.run === "docker") {
        ganache.stop(function (err, data) {
          console.log("\n", "Removing cloned blockchain...", "\n");
          if (!ganache) return;
          ganache.remove(function (err, data) {
            process.exit(0);
          });
        });
      }
    });

    process.once("SIGTERM", () => {
      console.log("\n", "Stopping cloned blockchain...", "\n");
      if (interval) clearInterval(interval);
      if (argv.run && argv.run === "docker") {
        ganache.stop(function (err, data) {
          console.log("\n", "Removing cloned blockchain...", "\n");
          if (!ganache) return;
          ganache.remove(function (err, data) {
            process.exit(0);
          });
        });
      }
    });
  }
};

const main = async (argv = yargs.argv) => {
  process.once("SIGINT", () => {
    console.log("\n");
  });

  process.once("SIGTERM", () => {
    console.log("\n");
  });

  try {
    // TODO: clean up into modular function
    const config =
      (await getConfig("cwa-config.js")) ||
      (await getConfig("cwa-config.json"));

    const load = await loadConfig(config);
    Object.entries(load).forEach(([key, value]) => (argv[key] = value));

    await promptMissingArgs(argv);
    await start(argv);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

export default main;
