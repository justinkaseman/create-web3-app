var Docker = require("dockerode");
export default () => {
  console.log("clone");
  var docker = new Docker({ socketPath: "/var/run/docker.sock" });
  docker.run(
    "trufflesuite/ganache-cli",
    [],
    process.stdout,
    { PortBindings: { "80/tcp": [{ HostPort: "8888" }] } },
    function (err, data, container) {
      // ....
      console.log(data, err, container);
    }
  );
};
