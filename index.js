require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const {verify_account} =  require('./controllers/user/auth')


app.use(cors())

// import routes
const userAuthRoutes = require('./routes/user/auth');
const adminAuthRoutes = require('./routes/admin/auth');
const adminProfileRoutes = require('./routes/admin/profile');

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
app.use('/v1', userAuthRoutes)
app.use('/v1', adminAuthRoutes)
app.use('/v1', adminProfileRoutes)
app.get('/user/account-validate/:token', verify_account)

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log('listening on '+port);
})