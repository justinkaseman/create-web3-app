const inquirer = require("inquirer");
import { Answers } from "inquirer";

const initialQuestions = [
  {
    type: "list",
    name: "template",
    message: "Which template would you like to start from?",
    choices: ["Truffle • Web3.js", "Buidler • Ethers.js • Waffle"],
  },
];

const choiceToValue = {
  "Truffle • Web3.js": "truffle",
  "Buidler • Ethers.js • Waffle": "buidler",
};

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
