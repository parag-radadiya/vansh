module.exports = {
  apps: [
    {
      name: "vercel-node-app",
      script: "api/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    }
  ]
};