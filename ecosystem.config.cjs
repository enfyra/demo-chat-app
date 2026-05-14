module.exports = {
  apps: [
    {
      name: 'enfyra-nuxt-chat-app',
      cwd: __dirname,
      script: 'node',
      args: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: '3003',
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '512M',
    },
  ],
}
