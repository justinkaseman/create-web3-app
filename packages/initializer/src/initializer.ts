import "source-map-support/register";
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

    await unpack(tempDirectory + `/${argv.template}`, destination, logger);

    await cleanupTemp(tempDirectory, logger);

    await install(destination, logger);

    logger.succeed(
      "Your create-web3-app template is ready to go!\nCheck the README.md file for getting started information"
    );
  } catch (error) {
    tempDirectory?.cleanup();
    logger.fail("Failed to initialize template");
    throw error;
  }
};

async function main(argv) {
  await promptMissingArgs(argv);
  if (!argv.force) await checkEmptyDirectory(process.cwd());
  initialize(argv);
}

export default main;
