#!/usr/bin/env node
const fork = require("child_process").fork;
import * as yargs from "yargs";

yargs
  .scriptName("@create-web3-app/scripts")
  .usage("$0 <cmd> [args]")
  .command(
    "ipfs",
    "Wraps a compiled client application to be served by IPFS",
    (yargs) => {
      yargs.positional("directory", {
        alias: ["dir", "d"],
        type: "string",
        default: "./build",
        description: "where to look for the production built code",
      });
    },
    function (argv) {
      const script = require.resolve("./scripts/ipfs");
      fork(script, [], {
        stdio: "inherit",
      });
    }
  )
  .help().argv;
