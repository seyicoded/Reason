require('dotenv').config()
const express = require('express');
const app = express();
const {verify_account} =  require('./controllers/user/auth')

// import routes
const userRoutes = require('./routes/user/auth');
const adminRoutes = require('./routes/admin/auth');

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
app.use('/v1', adminRoutes)
app.get('/user/account-validate/:token', verify_account)

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log('listening on '+port);
})