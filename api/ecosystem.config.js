// ecosystem.config.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const os = require("os");
const cpuCount = os.cpus().length;

module.exports = {
  apps: [
    {
      name: "prod_api",
      script: "build/index.js",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
