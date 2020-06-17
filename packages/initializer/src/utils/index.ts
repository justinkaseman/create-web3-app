import unbox from "./unbox";
import fs from "fs";
import config from "../config";
import tmp from "tmp";
import process from "process";
const cwd = require("process").cwd();
import path from "path";

export = {
  downloadBox: async (url: string, destination: string, events: any) => {
    events.emit("Downloading Template: start");

    try {
      await unbox.fetchRepository(url, destination);
      events.emit("Downloading Template: succeed");
    } catch (error) {
      events.emit("Initialize failed");
      throw error;
    }
  },

  readBoxConfig: async (destination: string) => {
    const possibleConfigs = [
      path.join(destination, "box.json"),
      path.join(destination, "init.json"),
    ];

    const configPath = possibleConfigs.reduce(
      (path, alt) => path || (fs.existsSync(alt) && alt),
      undefined
    );

    return await config.read(configPath);
  },

  setUpTempDirectory: (events: any) => {
    events.emit("Preparing To Download: start");
    const options = {
      dir: process.cwd(),
      unsafeCleanup: true,
    };
    try {
      const tmpDir = tmp.dirSync(options);
      events.emit("Preparing To Download: succeed");
      return {
        path: path.join(tmpDir.name, "box"),
        cleanupCallback: tmpDir.removeCallback,
      };
    } catch (error) {
      events.emit("Initialize failed");
      throw error;
    }
  },

  unpackBox: async (
    tempDir: string,
    destination: string,
    boxConfig: any,
    unpackBoxOptions: any
  ) => {
    unbox.prepareToCopyFiles(tempDir, boxConfig);
    await unbox.copyTempIntoDestination(tempDir, destination, unpackBoxOptions);
  },

  setUpBox: (boxConfig: any, destination: string, events: any) => {
    events.emit("Unpacking template: start");
    try {
      unbox.installBoxDependencies(boxConfig, destination);
      events.emit("Unpacking template: succeed");
    } catch (error) {
      events.emit("Initialize failed");
      throw error;
    }
  },
};
