import express from "express";
import passport from "passport";
import MockStrategy from "passport-mock-strategy";

import { configureApp } from "./configureApp";
import { router } from "./routes/routes";

import dotenv from "dotenv";
import { redisConnection } from "./db/redis";
import { handleError } from "./errors/handleError";
import { initialiseLogging } from "./logging";

dotenv.config({ path: ".env.development" });

const config = {
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
};

const app = express();
initialiseLogging(app);

configureApp(app, config);

router(app, config);

if (process.env.BEEBOP_TEST === "true") {
  passport.use(new MockStrategy());
  app.get("/login/mock", passport.authenticate("mock"), (req, res) => {
    res.send({ status: "ok" });
  });
}

const port = process.env.PORT || config.server_port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

const redis = redisConnection(config.redis_url, () => {
  throw Error(`Failed to connect to redis server ${config.redis_url}`);
});
app.locals.redis = redis;

app.use(handleError);
