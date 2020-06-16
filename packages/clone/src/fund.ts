import { URI, LIQUIDITY } from "./constants";
const Web3 = require("web3");
import { legos } from "@studydefi/money-legos";
const util = require("util");
const setTimeoutPromise = util.promisify(setTimeout);

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
            // const provider = new ethers.providers.JsonRpcProvider(URI);
            // let wallet = ethers.Wallet.fromMnemonic(config.MNEMONIC);
            // wallet = wallet.connect(provider);
            // const contract = new ethers.Contract(
            //   legos.erc20[tokenName].address,
            //   legos.erc20[tokenName].abi,
            //   wallet.getSigner()
            // );
            // console.log(tokenName, contract);
            // contract.transfer(accounts[i], tokenAmount).then((data) => {
            //   console.log("log", data);
            //   resolve();
            // });

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

export async function fundERC20(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    setTimeoutPromise(5000).then(async () => {
      try {
        const web3: typeof Web3 = new Web3(URI);
        const accounts = await web3.eth.getAccounts();
        const abi: any = legos.erc20.dai.abi;

        const contract = new web3.eth.Contract(abi, legos.erc20.dai.address);
        const balance1 = await contract.methods
          .balanceOf(accounts[0])
          .call({ from: accounts[0] });
        console.log("\n\n DAI balance: ", balance1);

        const seed = await Promise.all(
          Object.entries(LIQUIDITY).reduce((acc, [token, address]) => {
            try {
              console.log("Seeding ", token.toUpperCase(), "...");
              const transactions = buildFundTransactions(token, address);
              return [...acc, ...transactions];
            } catch (e) {
              console.error(e);
              return acc;
            }
          }, [])
        );
        if (seed) {
          const balance = await contract.methods
            .balanceOf(accounts[0])
            .call({ from: accounts[0] });
          console.log("\n\nDAI balance: ", balance);
          resolve(true);
        }
      } catch (e) {
        console.log(e);
        reject(false);
      }
    });
  });
}
