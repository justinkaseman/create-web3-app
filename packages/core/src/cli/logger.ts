const chalk = require("chalk");
const log = console.log;

export function logTitle() {
  const width = process.stdout.columns;
  if (width > 100)
    log(
      chalk.blue(
        `\n                     _                      _      _____                     ` +
          `\n                    | |                    | |    |____ |                    ` +
          `\n  ___ _ __ ___  __ _| |_ ___  __      _____| |__      / /   __ _ _ __  _ __  ` +
          `\n / __| '__/ _ \\/ _\` | __/ _ \\ \\ \\ /\\ / / _ \\ '_ \\     \\ \\  / _\` | '_ \\| '_ \\ ` +
          `\n| (__| | |  __/ (_| | |_| __/  \\ V  V /  __/ |_) |.___/ / | (_| | |_) | |_) |` +
          `\n \\___|_|  \\___|\\__,_|\\__\\___|   \\_/\\_/ \\___|_.__/ \\____/   \\__,_| .__/| .__/ ` +
          `\n                                                                | |   | |    ` +
          `\n                                                                |_|   |_|    ` +
          `\n`
      )
    );
  else log(chalk.bold.underline.blue("\nCREATE-WEB3-APP\n"));
}
