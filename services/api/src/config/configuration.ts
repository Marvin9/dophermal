export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  github: {
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
    client_secret: process.env.GITHUB_OAUTH_SECRET,
    callback_url: process.env.GITHUB_OAUTH_CALLBACK_URL,
  },
  database: {
    path: process.env.SQLITE_DATABASE_PATH,
  },
});
