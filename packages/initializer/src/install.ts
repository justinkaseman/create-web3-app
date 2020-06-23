const spawn = require("child_process").spawn;
const chalk = require("chalk");

enum PackageManagers {
  yarn = "yarn",
  npm = "npm",
}

export async function hasPackageManager(name: PackageManagers) {
  try {
    await spawn(`${name}`, ["--version"], { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

export function install(destination, logger) {
  return new Promise(async (resolve, reject) => {
    try {
      if (hasPackageManager(PackageManagers.yarn)) {
        logger.log("Installing packages with Yarn...");
        const result = spawn(`yarn install && cd client && yarn install`, {
          cwd: destination,
          shell: true,
        });
        result.stdout.on("data", (data) => {
          logger.log(`Installing packages with Yarn... ${data}`);
        });
        result.on("close", (code) => {
          if (code === 0) {
            logger.succeed(
              `Installing packages with Yarn... ${chalk.green("success!")}`
            );
            return resolve();
          } else {
            reject("Could not install with Yarn");
          }
        });
      } else if (hasPackageManager(PackageManagers.npm)) {
        logger.log("Installing packages with NPM...");
        const result = spawn(`npm install && cd client && npm install`, {
          cwd: destination,
          shell: true,
        });
        result.stdout.on("data", (data) => {
          logger.log(`Installing packages with NPM... ${data}`);
        });
        result.on("close", (code) => {
          if (code === 0) {
            logger.succeed(
              `Installing packages with NPM... ${chalk.green("success!")}`
            );
            return resolve();
          } else {
            reject("Could not install with NPM");
          }
        });
      }
    } catch (e) {
      console.log("Failed to install: ", e.message);
      reject(false);
    }
  });
}
