import express from "express";

import { configApp } from './configApp';
import { router } from './routes/routes';
import config from './resources/config.json';

const app = express();

configApp(app)

router(app)

const port = process.env.PORT || config.server_port;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
