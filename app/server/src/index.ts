import express from "express";

import { configureApp } from './configApp';
import { router } from './routes/routes';
import config from './resources/config.json';

const app = express();

configureApp(app)

router(app)

const port = process.env.PORT || config.server_port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
