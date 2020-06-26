# create-web3-app/clone

Run a development copy of mainnet loaded with relevent state.

Ganache-core is run either in-process or in a docker container, then ERC20 funds are seeded to the initial 10 accounts, and local smart contracts are deployed.

## Table of Contents

- [Usage](#🛠-usage)
- [Documentation References](#documentation-references)

## 🛠 Usage

With the `core` CLI installed:

```sh
create-web3-app clone [arguments]
```

## Arguments

|    Flag |                  Description                  |  Type  |        Choices        |
| ------: | :-------------------------------------------: | :----: | :-------------------: |
|  run, r | the place to start the development blockchain | string | `process` or `docker` |
| node, n | the place to start the development blockchain | string |  `full` or `archive`  |
|     url |      the location of node to clone from       | string |           -           |

## Additional options:

--version Show version number

--help Show help

## Using as a standalone module

This module can also be imported and used as a function. The only argument is an object containing key-value pairs of the flag name to the value.

```
import clone from "@create-web3-app/clone";

clone(
    {
        run: "docker",
        node: "full"
    }
);

```

## Documentation References

[Dockerode](https://github.com/apocas/dockerode) - Node.js module for Docker's Remote

[Ganache](https://github.com/trufflesuite/ganache-core) - Personal blockchain for Ethereum development.

[web3.js](https://web3js.readthedocs.io/en/v1.2.9/) - Interact with a local or remote ethereum node using HTTP, IPC or WebSocket.
