import fs from "fs-extra";
import inquirer from "inquirer";
import tmp from "tmp";
import process from "process";
import path from "path";
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
    dir: process.cwd(),
    unsafeCleanup: true,
  };
  try {
    const tmpDir = tmp.dirSync(options);
    logger.log("Successfully set up a temporary directory!");
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
    const download = await githubDownload({
      url: `https://github.com/justinkaseman/create-web3-app/tree/master/packages/cwa-templates/${template}`,
      to: path,
    });
    if (download) {
      logger.log("Successfully downloaded template from Github!");
      return;
    }
  } catch (error) {
    throw error;
  }
};

async function promptOverwrites(
  fileCollisions: Array<string>,
  logger = console
) {
  const overwriteContents = [];

  for (const file of fileCollisions) {
    logger.log(`${file} already exists in this directory...`);
    const overwriting: inquirer.Questions = [
      {
        type: "confirm",
        name: "overwrite",
        message: `Overwrite ${file}?`,
        default: false,
      },
    ];

    const { overwrite } = await inquirer.prompt(overwriting);
    if (overwrite) {
      fs.removeSync(file);
      overwriteContents.push(file);
    }
  }

  return overwriteContents;
}

export async function unpack(
  tempDir: string,
  destination: string,
  options: any
) {
  fs.ensureDirSync(destination);
  const { force, logger } = options;
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
}

export async function cleanupTemp(tempDirectory, logger) {
  logger.log("Cleaning up temporary files");
  tempDirectory?.cleanup();
}
