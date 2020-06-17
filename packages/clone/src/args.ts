import { Answers } from "inquirer";
var inquirer = require("inquirer");

const initialQuestions = [
  {
    type: "list",
    name: "run",
    message: "How would you like to run your development blockchain?",
    choices: ["In this terminal process", "In a Docker container"],
  },
  {
    type: "list",
    name: "node",
    message: "Where would you like to reference the main network from?",
    choices: [
      "A full node - free, but needs to refresh every 128 blocks (~30 minutes)",
      "An archive node - does not need to refresh, but costs some money to get started",
    ],
  },
];

const nodeToProviders = {
  full: ["Infura (recommended for beginners)"],
  archive: ["Moonnet (recommended for beginners"],
};

const providers = {
  infura: {
    urlPrefix: "https://mainnet.infura.io/v3/",
    description: () => {
      console.log("HEYYY");
    },
  },
  moonnet: {
    urlPrefix: "https://node.moonnet.space/uuid/",
    description: () => {
      console.log("HEYYY");
    },
  },
};

const choiceToValue = {
  "In this terminal process": "process",
  "In a Docker container": "docker",
  "A full node - free, but needs to refresh every 128 blocks (~30 minutes)":
    "full",
  "An archive node - does not need to refresh, but costs some money to get started":
    "archive",
};

function promptInput(provider): Promise<string> {
  return new Promise((resolve, reject) => {
    const isFullURL = provider === "I have my own endpoint to provide";
    let providerName;
    if (!isFullURL) {
      providerName = provider.split(" ")[0].toLowerCase();
      providers[providerName].description();
    }
    const message = isFullURL
      ? "Enter the HTTP endpoint that the node can be accessed at"
      : `Enter your ${
          providerName[0].toUpperCase() + providerName.slice(1)
        } ID: `;
    inquirer
      .prompt([
        {
          type: "input",
          name: "url",
          message,
          validate: function (value) {
            // TODO: more robust validation
            const pass = value.match(/^\S*$/);
            if (pass) {
              return true;
            }
            const inputType = isFullURL ? "url" : "id";
            return `Invalid ${inputType}, please re-enter`;
          },
        },
      ])
      .then((answers: Answers) => {
        if (isFullURL) resolve(answers["url"]);
        else resolve(providers[providerName].urlPrefix + answers["url"]);
      })
      .catch((error) => {
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
        reject();
      });
  });
}

function promptUrl(argv, parentResolve: Function): Promise<void> {
  return new Promise((resolve, reject) => {
    if (argv["url"]) return parentResolve();
    inquirer
      .prompt([
        {
          type: "list",
          name: "provider",
          message: "Are you using a 3rd party RPC provider?",
          choices: [
            ...nodeToProviders[argv["node"]],
            "I have my own endpoint to provide",
          ],
        },
      ])
      .then(async (answers: Answers) => {
        const url = await promptInput(answers["provider"]);
        if (url) {
          argv.url = url;
          resolve(parentResolve());
        } else reject();
      })
      .catch((error) => {
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
        reject();
      });
  });
}

export function promptMissingArgs(argv): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const argsToAsk = initialQuestions.filter(
      (question) => !argv[question.name]
    );
    if (argsToAsk.length === 0) return resolve();
    inquirer
      .prompt(argsToAsk)
      .then(async (answers: Answers) => {
        Object.entries(answers).forEach(([name, answer]: [string, string]) => {
          argv[name] = choiceToValue[answer];
        });
        await promptUrl(argv, resolve);
      })
      .catch((error) => {
        if (error.isTtyError) {
          // Prompt couldn't be rendered in the current environment
        } else {
          // Something else when wrong
        }
        reject();
      });
  });
}