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
          alias: ["r"],
          type: "string",
          choices: ["process", "docker"],
          description: "the place to start the development blockchain",
        });
        yargs.positional("node", {
          alias: ["n"],
          type: "string",
          choices: ["full", "archive"],
          description: "the type of node to clone from",
        });
        yargs.positional("url", {
          type: "string",
          description: "the location of node to clone from",
        });
      },
      function (argv) {
        logTitle();
        clone(argv);
      }
    )
    .command(
      "initialize",
      "Start a DApp from using a template architecture",
      (yargs) => {
        yargs.positional("template", {
          alias: ["t"],
          type: "string",
          choices: ["truffle", "buidler"],
          description: "the code architecture to start from",
        });
        yargs.positional("pkgm", {
          type: "string",
          choices: ["yarn", "npm"],
          default: "yarn",
          description: "the package manager to install dependencies with",
        });
        yargs.positional("force", {
          alias: ["f"],
          type: "boolean",
          default: false,
          description: "copy template into a directory that already has files",
        });
        yargs.positional("verbose", {
          alias: ["v"],
          type: "boolean",
          default: false,
          description: "prints all logs to the console",
        });
      },
      function (argv) {
        logTitle();
        initializer(argv);
      }
    )
    .help().argv;
};
