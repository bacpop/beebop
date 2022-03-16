import express from "express"
import cors from "cors";
import morgan from "morgan";

import { router } from './routes/routes';

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

router(app)

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
