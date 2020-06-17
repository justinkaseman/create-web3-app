import "source-map-support/register";
import utils from "./utils";
import fse from "fs-extra";
import inquirer from "inquirer";

const Box = {
  unbox: async (
    url: string,
    destination: string,
    options: any = {},
    config: any
  ) => {
    const { events } = config;
    let tempDirCleanup;
    const logger = options.logger || { log: () => {} };
    const unpackBoxOptions = {
      logger: options.logger,
      force: options.force,
    };

    try {
      await Box.checkDir(options, destination);
      const tempDir = await utils.setUpTempDirectory(events);
      const tempDirPath = tempDir.path;
      tempDirCleanup = tempDir.cleanupCallback;

      await utils.downloadBox(url, tempDirPath, events);

      const boxConfig = await utils.readBoxConfig(tempDirPath);

      await utils.unpackBox(
        tempDirPath,
        destination,
        boxConfig,
        unpackBoxOptions
      );

      events.emit("Cleaning Temp Files:start");
      tempDirCleanup();
      events.emit("Cleaning Temp Files:succeed");

      await utils.setUpBox(boxConfig, destination, events);

      return boxConfig;
    } catch (error) {
      if (tempDirCleanup) tempDirCleanup();
      events.emit("Initialize failed");
      throw error;
    }
  },

  checkDir: async (options: any = {}, destination: string) => {
    let logger = options.logger || console;
    if (!options.force) {
      const unboxDir = fse.readdirSync(destination);
      if (unboxDir.length) {
        logger.log(`This directory is non-empty...`);
        const prompt: inquirer.Questions = [
          {
            type: "confirm",
            name: "proceed",
            message: `Proceed anyway?`,
            default: true,
          },
        ];
        const answer = await inquirer.prompt(prompt);
        if (!answer.proceed) {
          logger.log("Initialize cancelled");
          process.exit();
        }
      }
    }
  },
};

export default Box;
