<h1 align="center">
create-web3-app
</h1>

Get started on a DeFi DApp at lightning speed ⚡️

Build against mainnet and deploy the front-end to IPFS with 3 commands

## Table of Contents

- [Get started](#🚀-get-started-in-minutes)
- [How to contribute](#contributing)
- [Documentation References](#documentation-references)
- [License](#📃-license)

## 🚀 Get started in minutes

⓵ Install the create-web3-app command line tool

Open your terminal and type in the following command:

```sh
npm install -g create-web3-app
```

⓶ Initialize from a template architecture with all the tools that you will need [(see advanced usage)](./packages/initializer/README.md)

Navigate your terminal to the location that you would like to build your project at and run:

```sh
create-web3-app initialize
```

⓷ Clone and run a development copy of the Ethereum mainnet pre-loaded and ready to build against [(see advanced usage)](./packages/initializer/README.md)

Navigate your terminal to the location that you would like to build your project at and run:

```sh
create-web3-app clone
```

⓸ Once you are ready to show off your project use the provided scripts to create a censor resistant deployment [(see advanced usage)](./packages/initializer/README.md)

From inside your `client` directory run the script using your favorite package manager:

```sh
npm build-ipfs
```

You now have a client build ready for your favorite platform - such as Heroku.

## Contributing

This repository is set up as a [monorepo](https://trunkbaseddevelopment.com/monorepos/) that is managed using [Lerna](https://github.com/lerna/lerna). There are [multiple packages](/packages) managed in this single codebase, even though they are all published to NPM seperately.

Development is undergone using a [branching model](https://nvie.com/posts/a-successful-git-branching-model/). Commits are made using a [semantic commit](https://seesparkbox.com/foundry/semantic_commit_messages) style.

Feel free to open a Github issue for bugs, feature requests, or disccusion!

## Documentation References

[TypeScript](https://www.typescriptlang.org/docs/home.html) - A typed superset of JavaScript that compiles to plain JavaScript.

[Lerna](https://github.com/lerna/lerna) - A tool for managing JavaScript projects with multiple packages.

[Jest](https://jestjs.io/docs/en/getting-started) - A delightful JavaScript Testing Framework with a focus on simplicity

(See specific packages for specific technologies)

## 📃 License

Create-Web3-App is open source software under the [MIT License](./LICENSE).

### 🌉 Made in the SF Bay Area with lots of coffee and hope for the future
