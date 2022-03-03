const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const routes = require('./routes/routes');

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());

routes(app)

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
