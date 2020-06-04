async function isInstalled(): Promise<boolean> {
  // TODO: This doesn't support windows
  const { exec } = await import("child_process");
  return new Promise((resolve) => {
    exec("which docker", (error?: any) => resolve(!error));
  });
}

async function isRunning(docker): Promise<boolean> {
  try {
    const result = await docker.ping();
    return result.toString() === "OK";
  } catch (error) {
    return false;
  }
}

export default async () => {
  try {
    const Docker = await import("dockerode");
    if (!(await isInstalled())) throw new Error("Docker is not installed!");
    var docker = new Docker({ socketPath: "/var/run/docker.sock" });
    if (!(await isRunning(docker)))
      throw new Error("Docker is not running, please start it!");
    console.log("\n", "Pulling latest image", "\n");
    await docker.pull("ethereum/client-go", function (err, stream) {
      console.log("\n", "Starting docker container", "\n");
      docker.createContainer(
        {
          Image: "ethereum/client-go",
          Cmd: [],
          name: "create-web3-app",
          // PortBindings: {
          //   "8545/tcp": [{ HostPort: "8545" }],
          //   // "8546/tcp": [{ HostPort: "8546" }],
          //   "30303/tcp": [{ HostPort: "30303" }],
          //   // "30304/udp": [{ HostPort: "30304" }],
          // },
          // volume: "/Users/justinkaseman/ethereum:/root",
        },
        (err, container) => {
          container.start((err, data) => {
            process.once("SIGINT", () => {
              container.stop(function (err, data) {
                console.log("\n", "Stopping cloned blockchain...", "\n");
                container.remove(function (err, data) {
                  console.log("\n", "Removing cloned blockchain...", "\n");
                });
              });
            });
            container.attach(
              { stream: true, stdout: true, stderr: true },
              function (err, stream) {
                stream.pipe(process.stdout, { end: false });
              }
            );
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
  }
};
