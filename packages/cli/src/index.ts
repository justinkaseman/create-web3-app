import semver from "semver";

//  Node version compatibility
const minimumNodeVersion = "8.9.4";
if (!semver.satisfies(process.version, ">=" + minimumNodeVersion)) {
  console.log(
    "Error: Node version not supported. You are currently using version " +
      process.version.slice(1) +
      " of Node. Truffle requires Node v" +
      minimumNodeVersion +
      " or higher."
  );

  process.exit(1);
}
