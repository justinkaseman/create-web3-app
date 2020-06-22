const chalk = require("chalk");
const ora = require("ora");
import { Ora } from "ora";
const clog = console.log;

export function logError(message) {
  clog(`\n${chalk.red(message)}\n`);
}

const oraOptions = { spinner: "squareCorners" };

export class Logger {
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

  private clean(message: string) {
    const split = message.split("\n");
    const text = split.find((chunk) => {
      return chunk && /^[a-zA-Z0-9_.\s]*$/.test(chunk);
    });
    return text;
  }

  log(message: string, clean?: boolean) {
    if (this.verbose) return this.vlogger.log(message);
    let text: string = message.slice();
    if (clean) text = this.clean(text);
    if (text) this.logger.text = message;
  }

  succeed(message: string, spin?: boolean) {
    if (this.verbose) return ora(oraOptions).succeed(message);
    this.logger.succeed(message);
    if (spin) this.logger = ora(oraOptions).start();
  }

  fail(message: string, spin?: boolean) {
    if (this.verbose) return ora(oraOptions).fail(message);
    this.logger.fail(message);
    if (spin) this.logger = ora(oraOptions).start();
  }
}
