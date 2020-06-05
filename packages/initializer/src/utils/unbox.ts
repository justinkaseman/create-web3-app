import fse from "fs-extra";
import path from "path";
import ghdownload from "github-download";
import { execSync } from "child_process";
import inquirer from "inquirer";

function fetchRepository(url: string, dir: string) {
  return new Promise((accept, reject) =>
    // Download the package from github.
    ghdownload(url, dir).on("err", reject).on("end", accept)
  );
}

function prepareToCopyFiles(tempDir: string, { ignore }: any) {
  const needingRemoval = ignore;

  // remove box config file
  needingRemoval.push("truffle-box.json");
  needingRemoval.push("truffle-init.json");

  needingRemoval
    .map((fileName: string) => path.join(tempDir, fileName))
    .forEach((filePath: string) => fse.removeSync(filePath));
}

async function promptOverwrites(
  contentCollisions: Array<string>,
  logger = console
) {
  const overwriteContents = [];

  for (const file of contentCollisions) {
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
      fse.removeSync(file);
      overwriteContents.push(file);
    }
  }

  return overwriteContents;
}

async function copyTempIntoDestination(
  tmpDir: string,
  destination: string,
  options: any
) {
  fse.ensureDirSync(destination);
  const { force, logger } = options;
  const boxContents = fse.readdirSync(
    `${tmpDir}/packages/cwa-template/template`
  );
  const destinationContents = fse.readdirSync(destination);

  const newContents = boxContents.filter(
    (filename) => !destinationContents.includes(filename)
  );

  const contentCollisions = boxContents.filter((filename) =>
    destinationContents.includes(filename)
  );

  let shouldCopy;
  if (force) {
    shouldCopy = boxContents;
  } else {
    const overwriteContents = await promptOverwrites(contentCollisions, logger);
    shouldCopy = [...newContents, ...overwriteContents];
  }

  for (const file of shouldCopy) {
    fse.copySync(`${tmpDir}/${file}`, `${destination}/${file}`);
  }
}

function installBoxDependencies({ hooks }: any, destination: string) {
  const postUnpack = hooks["post-unpack"];

  if (postUnpack.length === 0) return;
  execSync(postUnpack, { cwd: destination });
}

export = {
  copyTempIntoDestination,
  fetchRepository,
  installBoxDependencies,
  prepareToCopyFiles,
};
