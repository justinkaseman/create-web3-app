const util = require("util");
const exec = util.promisify(require("child_process").exec);
import { getConfig } from "./config";

async function hasLocalDependency(packageName) {
  try {
    await exec(`npm ls ${packageName}`);
    return true;
  } catch (e) {
    // When not found will throw
  }
}

async function hasGlobalDependency(packageName) {
  try {
    await exec(`npm ls -g ${packageName}`);
    return true;
  } catch (e) {
    // When not found will throw
    return false;
  }
}

export async function migrate() {
  try {
    // Check if the project is using Truffle
    const truffleConfig = getConfig("truffle-config.js");
    if (truffleConfig) {
      console.log("Truffle project found!");

      // Make sure that Truffle is ready to use
      const installed =
        hasGlobalDependency("truffle") || hasLocalDependency("truffle");

      if (installed) {
        // Run `truffle migrate`
        await exec(`npx truffle migrate`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
      }
    }

    // Check if the project is using Buidler
    const buidler = getConfig("buidler.config.js");
    if (buidler) {
      console.log("Buidler project found!");

      // Make sure that Buidler is ready to use
      const installed =
        hasGlobalDependency("@nomiclabs/buidler") ||
        hasLocalDependency("@nomiclabs/buidler");
      if (installed) {
        // Run compile and deploy
        await exec(`npx buidler compile`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        });
        await exec(
          `npx buidler run --network cwa-clone scripts/deploy.js`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          }
        );
      }
    }

    // No known project could be found
  } catch (e) {
    console.log("Error: ", e);
    return false;
  }
}
