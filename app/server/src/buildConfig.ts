export const buildConfig = () => ({
  server_port: process.env.PORT || 4000,
  api_url: process.env.API_URL || "http://localhost:5000",
  client_url: process.env.CLIENT_URL || "http://localhost:5173",
  server_url: process.env.SERVER_URL || "http://localhost:4000",
  redis_url: process.env.REDIS_URL || "redis://localhost:6379",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
});
