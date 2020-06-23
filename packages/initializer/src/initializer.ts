import "source-map-support/register";
const chalk = require("chalk");
import Logger from "./logger";
import {
  setUpTempDirectory,
  checkEmptyDirectory,
  downloadIntoTemp,
  unpack,
  cleanupTemp,
} from "./filesystem";
import { promptMissingArgs } from "./args";
import { install } from "./install";

const initialize = async (argv) => {
  let tempDirectory;
  const destination = process.cwd();
  const logger = new Logger(argv.verbose);
  try {
    tempDirectory = await setUpTempDirectory(logger);

    await downloadIntoTemp(argv.template, tempDirectory.path, logger);

    await unpack(tempDirectory.path + `/${argv.template}`, destination, {
      logger,
      force: argv.force,
    });

    await cleanupTemp(tempDirectory, logger);

    await install(destination, logger);

    console.log(
      chalk.cyan(
        "\nYour create-web3-app template is ready to go!\n\nCheck the README.md file for more information on getting started"
      )
    );
  } catch (error) {
    tempDirectory?.cleanup();
    logger.fail(chalk.red("Failed to initialize template"));
    process.exit(1);
  }
};

async function main(argv) {
  await promptMissingArgs(argv);
  if (!argv.force) await checkEmptyDirectory(process.cwd());
  initialize(argv);
}

export default main;
