import clone from "@create-web3-app/clone";
import initializer from "@create-web3-app/initializer";
import { logTitle } from "./logger";

import * as yargs from "yargs";

export default () => {
  yargs
    .scriptName("create-web3-app")
    .usage("$0 <cmd> [args]")
    .command(
      "clone",
      "Start a local cloned mainnet blockchain instance",
      (yargs) => {
        yargs.positional("run", {
          type: "string",
          describe: "where to run your development blockchain",
        });
        yargs.positional("node", {
          type: "string",
          describe: "what type of node are you referencing mainnet from",
        });
        yargs.positional("url", {
          type: "string",
          describe: "the place to access your node",
        });
      },
      function (argv) {
        logTitle();
        console.log("\nStarting clone...\n");
        clone(argv);
      }
    )
    .command(
      "initialize",
      "Start a DApp from using a template architecture",
      (yargs) => {
        yargs.positional("test", {
          type: "string",
          default: "Cambi",
          describe: "the name to say hello to",
        });
      },
      function (argv) {
        logTitle();
        console.log("\nCreating project from template...\n");
        const unboxOptions = { force: false };

        // .unbox() validates & unboxes truffle box repos
        // pass the current working directory as directory to unbox into
        initializer.unbox(
          "https://github.com/justinkaseman/create-web3-app",
          process.cwd(),
          unboxOptions,
          {
            events: {
              emit: (input) => console.log(input),
            },
          }
        );
      }
    )
    .help().argv;
};
