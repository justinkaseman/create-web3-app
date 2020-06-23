const ora = require("ora");
import { Ora } from "ora";

const oraOptions = { spinner: "squareCorners" };

export default class Logger {
  verbose: boolean;
  logger?: Ora;
  vlogger: Console;

  constructor(verbose = false) {
    this.verbose = verbose;
    if (!verbose) {
      const logger: Ora = ora(oraOptions);
      this.logger = logger.start();
    }
  }

  log(message: string) {
    if (this.verbose) this.vlogger.log(message);
    else this.logger.text = message;
  }

  succeed(message: string, continueSpinning?: boolean) {
    if (this.verbose) return ora(oraOptions).succeed(message);
    this.logger.succeed(message);
    if (continueSpinning) this.logger = ora(oraOptions).start();
  }

  fail(message: string, continueSpinning?: boolean) {
    if (this.verbose) ora(oraOptions).fail(message);
    this.logger.fail(message);
    if (continueSpinning) this.logger = ora(oraOptions).start();
  }

  start() {
    if (this.logger && !this.logger.isSpinning) this.logger.start();
  }

  stop() {
    if (this.logger && this.logger.isSpinning) this.logger.stop();
  }
}
