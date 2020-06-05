const { exec } = require("child_process");
console.log("\n", "Relinking NPM package...", "\n");
exec("npm link", { cwd: "packages/core" }, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
