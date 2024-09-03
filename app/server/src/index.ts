import express from "express";
import passport from "passport";
import MockStrategy from "passport-mock-strategy";

import { configureApp } from "./configureApp";
import { router } from "./routes/routes";

import dotenv from "dotenv";
import { redisConnection } from "./db/redis";
import { handleError } from "./errors/handleError";
import { initialiseLogging } from "./logging";
import { buildConfig } from "./buildConfig";

dotenv.config({ path: ".env.development" });

const config = buildConfig();

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
