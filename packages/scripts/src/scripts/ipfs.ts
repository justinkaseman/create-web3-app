const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs-extra");

async function checkDependency(packageName) {
  try {
    await exec(`npm ls ${packageName}`);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function checkGlobalDependency(packageName) {
  try {
    await exec(`npm ls -g ${packageName}`);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function hasVersion(pkg) {
  try {
    await exec(`${pkg} --version`);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function execBuild() {
  try {
    const hasCRA = await checkDependency("react-scripts");
    if (hasCRA) console.log("Building using create-react-app...");
    else console.log("Attempting to run 'build' script from package.json");

    const yarnInstalled = await hasVersion("yarn");
    if (!yarnInstalled) {
      const npm = hasVersion("npm");
      if (!npm) return new Error("NPM is not installed");
      await exec(`${hasCRA ? "npx react-scripts build" : "npm build"}`);
    }
    await exec(`yarn ${hasCRA ? "run react-scripts build" : "build"}`);

    return true;
  } catch (e) {
    console.log("Error while building application code:\n", e);
    return false;
  }
}

async function confirmBuild() {
  const pathToCheck = path.join(process.cwd(), "/build");
  if (fs.existsSync(pathToCheck)) {
    return pathToCheck;
  }
  return false;
}

async function copyServer(buildPath) {
  try {
    const outputDirectory = path.join(process.cwd(), "/build_ipfs");
    const buildOutputDir = path.join(outputDirectory, "/build");
    await fs.remove(outputDirectory);
    await fs.mkdirp(outputDirectory);
    await fs.move(buildPath, buildOutputDir);
    await fs.copyFile(
      path.join(process.argv[1], "../../ipfs_server/ipfs.js"),
      path.join(outputDirectory, "/ipfs.js")
    );
    await fs.copyFile(
      path.join(process.argv[1], "../../ipfs_server/package.json"),
      path.join(outputDirectory, "/package.json")
    );
    await fs.copyFile(
      path.join(process.argv[1], "../../ipfs_server/package-lock.json"),
      path.join(outputDirectory, "/package-lock.json")
    );
  } catch (e) {
    console.log("Error copying IPFS server:\n", e);
  }
}

async function main() {
  try {
    await execBuild();
    const buildPath = await confirmBuild();
    await copyServer(buildPath);
    console.log("Complete!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();

export default main;
