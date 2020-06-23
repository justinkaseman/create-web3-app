import fs from "fs-extra";
import inquirer from "inquirer";
import tmp from "tmp";
import process from "process";
import path from "path";
const chalk = require("chalk");
import { githubDownload } from "./download";

export const checkEmptyDirectory = async (destination: string) => {
  const directory = fs.readdirSync(destination);
  if (directory.length) {
    console.log(`This directory already has files in it...`);
    const prompt: inquirer.Questions = [
      {
        type: "confirm",
        name: "proceed",
        message: `Proceed? This may overwrite existing files`,
        default: true,
      },
    ];
    const answer = await inquirer.prompt(prompt);
    if (!answer.proceed) {
      console.log("Initialization cancelled");
      process.exit();
    }
  }
};

export const setUpTempDirectory = (logger) => {
  logger.log("Setting up a temporary directory...");
  const options = {
    unsafeCleanup: true,
  };
  try {
    const tmpDir = tmp.dirSync(options);
    return {
      tmpDir: tmpDir,
      path: path.join(tmpDir.name, "temp"),
      cleanup: tmpDir.removeCallback,
    };
  } catch (error) {
    throw error;
  }
};

export const downloadIntoTemp = async (template, path, logger) => {
  logger.log("Downloading template from Github...");
  try {
    const download = await githubDownload(
      {
        url: `https://github.com/justinkaseman/create-web3-app/tree/develop/packages/cwa-templates/${template}`,
        to: path,
      },
      logger
    );
    if (download) {
      logger.succeed(
        `Downloading template from Github...${chalk.green("success!")}`,
        true
      );
      return;
    }
  } catch (error) {
    throw error;
  }
};

async function promptOverwrites(fileCollisions: Array<string>, logger) {
  const overwriteContents = [];
  if (logger) logger.stop();
  for (const file of fileCollisions) {
    const overwriting: inquirer.Questions = [
      {
        type: "confirm",
        name: "overwrite",
        message: `${file} already exists in this directory...\nOverwrite ${file}?`,
        default: false,
      },
    ];

    const { overwrite } = await inquirer.prompt(overwriting);
    if (overwrite) {
      fs.removeSync(file);
      overwriteContents.push(file);
    }
  }

  if (logger) logger.start();

  return overwriteContents;
}

export async function unpack(
  tempDir: string,
  destination: string,
  options: any
) {
  const { force, logger } = options;
  logger.log("Unpacking template...");

  fs.ensureDirSync(destination);
  const contents = fs.readdirSync(tempDir);
  const destinationContents = fs.readdirSync(destination);

  const newContents = contents.filter(
    (filename) => !destinationContents.includes(filename)
  );

  const contentCollisions = contents.filter((filename) =>
    destinationContents.includes(filename)
  );

  let shouldCopy;
  if (force) {
    shouldCopy = contents;
  } else {
    const overwriteContents = await promptOverwrites(contentCollisions, logger);
    shouldCopy = [...newContents, ...overwriteContents];
  }

  for (const file of shouldCopy) {
    fs.copySync(`${tempDir}/${file}`, `${destination}/${file}`);
  }

  logger.succeed(`Unpacking template... ${chalk.green("success!")}`, true);
  return;
}

export function cleanupTemp(tempDirectory, logger) {
  return new Promise((resolve, reject) => {
    logger.log("Cleaning up...");
    tempDirectory?.cleanup();
    logger.succeed(`Cleaning up... ${chalk.green("success!")}`, true);
    resolve();
  });
}
