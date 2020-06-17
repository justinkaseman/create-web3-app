const chalk = require("chalk");
const log = console.log;

export function logError(message) {
  log("\n", chalk.red(message), "\n");
}
