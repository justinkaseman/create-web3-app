const ipfs = require("ipfs");
const IpfsHttpClient = require("ipfs-http-client");
const { globSource } = IpfsHttpClient;

async function main() {
  const IPFS = await ipfs.create();
  await IPFS.start();
  for await (const file of IPFS.add(
    globSource("./build", { recursive: true }),
    { progress: (data) => console.log("progress", data) }
  )) {
    console.log(file);
  }
}
main();
