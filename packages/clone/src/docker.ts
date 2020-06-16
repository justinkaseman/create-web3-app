import * as constants from "./constants";
const config = require("../config");
import Dockerode = require("dockerode");

export async function isInstalled(): Promise<boolean> {
  // TODO: This doesn't support windows
  const { exec } = await import("child_process");
  return new Promise((resolve) => {
    exec("which docker", (error?: any) => resolve(!error));
  });
}

export async function isRunning(docker: Dockerode): Promise<boolean> {
  try {
    const result = await docker.ping();
    return result.toString() === "OK";
  } catch (error) {
    return false;
  }
}

export async function startDocker(
  container: string
): Promise<Dockerode.Container> {
  return new Promise(async (resolve, reject) => {
    try {
      const Docker = await import("dockerode");

      if (!(await isInstalled())) throw new Error("Docker is not installed!");

      var docker = new Docker({ socketPath: "/var/run/docker.sock" });

      if (!(await isRunning(docker)))
        throw new Error("Docker is not running, please start it!");

      console.log("\n", "Pulling latest image", "\n");
      await docker.pull(constants.CONTAINERS[container](config).Image, {});

      await docker.createContainer(
        constants.CONTAINERS[container](config),
        (err, container) => {
          container.start(async (err, data) => {
            // Pipe container's logs to stdout
            container.attach(
              { stream: true, stdout: true, stderr: true },
              function (err, stream) {
                stream.pipe(process.stdout, { end: false });
              }
            );
            resolve(container);
          });
        }
      );
    } catch (error) {
      console.error(error);
      reject(false);
    }
  });
}

export function restartContainer(container) {
  return new Promise((resolve, reject) => {
    try {
      console.log("restarting...");
      container.stop(() => {
        container.start(() => {
          resolve(true);
        });
      });
    } catch (e) {
      console.error("Failed to restart container", e);
    }
  });
}
