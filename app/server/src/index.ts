import express from "express";
import MockStrategy from 'passport-mock-strategy';
import passport from 'passport';

import { configureApp } from './configureApp';
import { router } from './routes/routes';
import config from './resources/config.json';

const app = express();

configureApp(app)

router(app)

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
