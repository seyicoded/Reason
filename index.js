require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const {verify_account} =  require('./controllers/user/auth')


app.use(cors())

// import routes
const userAuthRoutes = require('./routes/user/auth');
const userProfileRoutes = require('./routes/user/profile');
const mainRoutes = require('./routes/user/main');

const pusherRoutes = require('./routes/pusher/auth');

const adminAuthRoutes = require('./routes/admin/auth');
const adminProfileRoutes = require('./routes/admin/profile');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const { initPusher } = require('./resource/general');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

// init pusher
initPusher();

app.get('/', (req, res)=>{
    return res.json({
        status: true,
        message: 'Service is Okay',
    });
})

// api v1
app.use('/v1', userAuthRoutes)
app.use('/v1', userProfileRoutes)
app.use('/v1', adminAuthRoutes)
app.use('/v1', adminProfileRoutes)
app.use('/v1', adminDashboardRoutes)
app.use('/v1', mainRoutes)
app.use('/v1', pusherRoutes)
app.get('/user/account-validate/:token', verify_account)

const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log('listening on '+port);
})