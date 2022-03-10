const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { router } = require('./routes/routes');

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
