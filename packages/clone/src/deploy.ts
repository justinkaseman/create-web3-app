const util = require("util");
const setTimeoutPromise = util.promisify(setTimeout);
const exec = util.promisify(require("child_process").exec);
const spawn = require("child_process").spawn;
const chalk = require("chalk");
import { URI, LIQUIDITY } from "./constants";
const Web3 = require("web3");
import { legos } from "@studydefi/money-legos";
import { Logger } from "./logger";
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

export function buildFundTransactions(
  tokenName: string,
  liqudityAddress: string,
  tokenAmount: number = 200,
  accountsCount: number = 1
  // TODO: type me
) {
  if (!tokenName) throw new Error("ERROR: Must given a token name to transfer");
  if (!liqudityAddress || !Web3.utils.isAddress(liqudityAddress))
    throw new Error(
      "ERROR: Must give a liquidity provider address to transfer from"
    );
  if (!legos.erc20[tokenName] || !LIQUIDITY[tokenName])
    throw new Error(`Unable not seed ${tokenName}`);

  return Array(accountsCount)
    .fill(1)
    .map(
      (_, i) =>
        new Promise(async (resolve, reject) => {
          try {
            const web3: typeof Web3 = new Web3(URI);
            const accounts = await web3.eth.getAccounts();
            const abi: any = legos.erc20[tokenName].abi;

            const contract = new web3.eth.Contract(
              abi,
              legos.erc20[tokenName].address
            );

            await contract.methods
              .transfer(accounts[i], tokenAmount)
              .send({ from: LIQUIDITY[tokenName] })
              .then(function (result) {
                resolve(result);
              });
          } catch (e) {
            return reject(e);
          }
        })
    );
}

export async function fundERC20(logger): Promise<boolean> {
  return new Promise((resolve, reject) => {
    logger.log("Seeding ERC20 tokens...");
    setTimeoutPromise(5000).then(async () => {
      try {
        const seed = await Promise.all(
          Object.entries(LIQUIDITY).reduce((acc, [token, address]) => {
            try {
              const transactions = buildFundTransactions(token, address);
              return [...acc, ...transactions];
            } catch (e) {
              console.error(e);
              return acc;
            }
          }, [])
        );
        if (seed) {
          logger.succeed(
            `Seeding ERC20 tokens... ${chalk.green("success!")}`,
            true
          );
          resolve(true);
        }
      } catch (e) {
        logger.fail(`Seeding ERC20 tokens... ${chalk.red("failed")}`, true);
        reject(false);
      }
    });
  });
}

export function migrate() {
  return new Promise(async (resolve, reject) => {
    const spinner = new Logger();

    try {
      fundERC20(spinner);
    } catch (error) {
      throw `Error while running deployments:\n${error}`;
    }

    try {
      // Check if the project is using Truffle
      const truffleConfig = await getConfig("truffle-config.js");
      if (truffleConfig) {
        spinner.log(chalk.green("Truffle project found"));

        // Make sure that Truffle is ready to use
        const installed =
          hasGlobalDependency("truffle") || hasLocalDependency("truffle");

        if (installed) {
          spinner.log("Deploying smart contracts...");

          // Run `truffle migrate`
          const run = spawn("truffle", ["migrate", "--network", "develop"]);
          run.stdout.on("data", function (data) {
            spinner.log("Deploying smart contracts..." + data.toString(), true);
          });
          run.on("exit", function (code) {
            spinner.succeed(
              `Deploying smart contracts... ${chalk.green("success!")}`
            );
            return resolve();
          });
        }
      }

      // Check if the project is using Buidler
      const buidler = await getConfig("buidler.config.js");
      if (buidler) {
        spinner.log(chalk.green("Buidler project found"));

        // Make sure that Buidler is ready to use
        const installed =
          hasGlobalDependency("@nomiclabs/buidler") ||
          hasLocalDependency("@nomiclabs/buidler");

        if (installed) {
          spinner.log("Deploying smart contracts...");

          // Run compile and deploy
          spinner.log("Deploying smart contracts...\n    Compiling");
          await exec(`npx buidler compile`, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return resolve();
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          });
          const run = spawn("npx", [
            "buidler",
            "run",
            "--network",
            "development",
            "scripts/deploy.js",
          ]);
          run.stdout.on("data", function (data) {
            spinner.log("Deploying smart contracts..." + data.toString());
          });
          run.on("exit", function (code) {
            spinner.succeed(
              `Deploying smart contracts... ${chalk.green("success!")}`
            );
          });
        }
      }

      // No known project could be found
    } catch (error) {
      spinner.fail(`Deploying smart contracts... ${chalk.red("failed")}`);
      throw `Error while running deployments:\n${error}`;
    }
  });
}
