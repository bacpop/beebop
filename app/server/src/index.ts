import express from "express";
import MockStrategy from 'passport-mock-strategy';
import passport from 'passport';

import { configureApp } from './configureApp';
import { router } from './routes/routes';

import fs from "fs";
import path from "path";

import configPath from "./args";
import { redisConnection } from "./db/redis";
import {initialiseLogging} from "./logging";
import {handleError} from "./errors/handleError";

const filename = path.join(configPath, "config.json");

if (!fs.existsSync(filename)) {
    throw new Error(`File ${configPath} does not exist`);
}

const configText = fs.readFileSync(filename, { encoding: "utf-8" });
const config = JSON.parse(configText);
if (!fs.existsSync(filename)) {
    throw new Error(`File ${configPath} does not exist`);
}
const app = express();
initialiseLogging(app);

configureApp(app, config);

router(app, config);

if (process.env.BEEBOP_TEST === "true") {
  passport.use(new MockStrategy());
  app.get('/login/mock', passport.authenticate('mock'), (req, res) => {
      res.send({ status: 'ok' });
  });
}
  
const port = process.env.PORT || config.server_port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

const redis = redisConnection(
    config.redis_url,
    () => { throw Error(`Failed to connect to redis server ${config.redis_url}`); }
);
app.locals.redis = redis;

app.use(handleError);
