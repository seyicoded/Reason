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