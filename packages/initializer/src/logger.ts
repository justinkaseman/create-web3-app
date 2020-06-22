const chalk = require("chalk");
const ora = require("ora");
import { Ora } from "ora";

export default class Logger {
  verbose: boolean;
  logger?: Ora;
  vlogger: Console;

  constructor(verbose = false) {
    this.verbose = verbose;
    if (!verbose) {
      const logger: Ora = ora();
      this.logger = logger.start();
    }
  }

  log(message: string) {
    if (this.verbose) this.vlogger.log(message);
    else this.logger.text = message;
  }

  succeed(message: string) {
    if (this.verbose) ora().succeed(chalk.green(message));
    else this.logger.succeed(chalk.green(message));
  }

  fail(message: string) {
    if (this.verbose) ora().fail(chalk.red(message));
    else this.logger.fail(chalk.red(message));
  }
}
