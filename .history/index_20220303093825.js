// mysql://b9db01a339619b:a3547f17@us-cdbr-east-05.cleardb.net/heroku_a3ee257e0c4678f?reconnect=true
require('dotenv').config()
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.get('/', (req, res)=>{
    return res.json({
        status: true,
        message: 'Service is Okay',
    });
})

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log('listening on '+port);
})