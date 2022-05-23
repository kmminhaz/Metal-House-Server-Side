// username : kmminhaz
// password: TKjcWRT889pogfXW
const express = require('express');
const cors = require('cors');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to Metal House');
});

app.listen(port, () => {
    console.log(`Metal-House Server is Running on the port ${port}`);
});