const chalk = require("chalk");
const clog = console.log;

export function logError(message) {
  clog("\n", chalk.red(message), "\n");
}
