const execSync = require("child_process").execSync;

enum PackageManagers {
  yarn = "yarn",
  npm = "npm",
}

export function hasPackageManager(name: PackageManagers) {
  try {
    execSync(`${name} --version`, { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

export function install(destination, logger) {
  try {
    if (hasPackageManager(PackageManagers.yarn))
      execSync(`yarn install`, { stdio: "ignore" });
    else if (hasPackageManager(PackageManagers.npm))
      execSync(`yarn install`, { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}
