require('dotenv').config()
const express = require('express');
const app = express();
const {verify_account} =  require('controllers/user/auth')

// import routes
const userRoutes = require('./routes/user/auth');

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

// api v1
app.use('/v1', userRoutes)
app.get('/user/account-va/:token', verify_account)

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log('listening on '+port);
})