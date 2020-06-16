export const config = (() => {})();

export const URI = "http://localhost:8545";

// Currently funds from Uniswap V1
export const LIQUIDITY = {
  bat: "0x2e642b8d59b45a1d8c5aef716a84ff44ea665914",
  dai: "0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667",
  // rep: "0x48b04d2a05b6b604d8d5223fd1984f191ded51af",
  // sai: "0x09cabec1ead1c0ba254b09efb3ee13841712be14",
  // usdc: "0x97dec872013f6b5fb443861090ad931542878126",
  // wbtc: "0x4d2f5cfba55ae412221182d8475bc85799a5644b",
  // weth: "0xa2881a90bf33f03e7a3f803765cd2ed5c8928dfb",
  // zrx: "0xae76c84c9262cdb9abc0c2c8888e62db8e22a0bf",
};

export const CONTAINERS = {
  geth: () => {
    return {
      Image: "ethereum/client-go",
      Cmd: [],
      name: "create-web3-app",
      PortBindings: {
        "8545/tcp": [{ HostPort: "8545" }],
        "8546/tcp": [{ HostPort: "8546" }],
        // "30303/tcp": [{ HostPort: "30303" }],
        "30303/udp": [{ HostPort: "30304" }],
      },
      v: "~/.create-web3-app:/geth",
    };
  },
  ganache: (INFURA_KEY, MNEMONIC) => {
    return {
      Image: "trufflesuite/ganache-cli",
      Cmd: [
        "ganache-cli",
        // "--db=/data/ganache",
        `--fork="https://mainnet.infura.io/v3/${INFURA_KEY}"`,
        "--hostname=0.0.0.0",
        `--mnemonic="${MNEMONIC}"`,
        "--blockTime=5",
        "--quiet",
        ...Object.values(LIQUIDITY).map((address) => `--unlock="${address}"`),
      ],
      name: "create-web3-app",
      PortBindings: {
        "8545/tcp": [{ HostPort: "8545" }],
      },
      // volumes: "~/.create-web3-app:/ganache",
    };
  },
};
