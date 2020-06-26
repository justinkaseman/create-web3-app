# create-web3-app/initializer

Initialize a DeFi DApp from a template architecture with all the tools that you will need to go to production ✨

Repositories are downloaded from Github into a temporary folder, copied into the user's current working directory, and a package manager installation step is run.

## Table of Contents

- [Usage](#🛠-usage)
- [Documentation References](#documentation-references)

## 🛠 Usage

With the `core` CLI installed:

```sh
create-web3-app initialize [arguments]
```

## Arguments

|        Flag |                      Description                      |  Type   |        Choices         |
| ----------: | :---------------------------------------------------: | :-----: | :--------------------: |
| template, t |          the code architecture to start from          | string  | `truffle` or `buidler` |
|        pkgm |   the package manager to install dependencies with    | string  |    `yarn` or `npm`     |
|    force, f | copy template into a directory that already has files | boolean |           -            |
|  verbose, v |            prints all logs to the console             | boolean |           -            |

## Additional options:

--version Show version number

--help Show help

## Using as a standalone module

This module can also be imported and used as a function. The only argument is an object containing key-value pairs of the flag name to the value.

```
import initializer from "@create-web3-app/initializer";

initializer(
    {
        template: "truffle",
        force: true
    }
);

```

## Documentation References

[Node.js](https://nodejs.org/dist/latest-v14.x/docs/api/) - JavaScript runtime environment that executes JavaScript code outside a web browser.
