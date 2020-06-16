import { Answers } from "inquirer";

var inquirer = require("inquirer");

enum RunOptions {
  DOCKER,
  PROCESS,
}

const questions = [
  {
    type: "list",
    name: "run",
    message: "How would you like to run your development blockchain?",
    choices: ["Node.js process", "Docker"],
  },
  {
    type: "list",
    name: "network",
    message: "Where would you like to reference the main network from?",
    choices: ["Infura (recommended for beginners)", "Moonnet", "Custom"],
  },
];

const choiceToValue = {
  "Node.js process": "node",
};

export function inquire(argv) {
  return new Promise((resolve, reject) => {
    const argsToAsk = questions.filter((question) => !argv[question.name]);
    inquirer
      .prompt(argsToAsk)
      .then((answers: Answers) => {
        Object.entries(answers).forEach(([name, answer]: [string, string]) => {
          argv[name] = choiceToValue[answer];
        });
        resolve();
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
