# create-web3-app/scripts

Useful scripts to make DApp development a breeze 💨

## Table of Contents

- [Installation](#installation)
- [Scripts](#scripts)
  - [Deploying front-end to IPFS](#📶-deploying-front-end-to-ipfs)
  - [License](#📃-license)

## Installation

With Yarn:

```bash
yarn add --dev @create-web3-app/scripts
```

With NPM:

```bash
npm install --save-dev @create-web3-app/scripts
```

## Scripts

The provided scripts can be used with the name `cwa-scripts`.

### 📶 Deploying front-end to IPFS

Build client code and wrap with an IPFS Daemon server to be deployed on your favorite platform for censor resistant webpages

Usage:

```bash
cwa-scripts ipfs
```

Outputs:
`[your-project-path]/client/build_ipfs`

Technology references:

- [IPFS](https://docs.ipfs.io/)
