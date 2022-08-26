const express = require("express");
const app = express.Router();
const {
    signinController,
    signupController,
    resendEmailController,
    requestOtpController,
    verifyOtpController,
    changePasswordWithOtpController,
    socialLoginController} =  require('../../controllers/user/auth')

app.post('/sign-in', signinController)
app.post('/sign-up', signupController)
app.post('/resend-email', resendEmailController)
app.post('/request-otp', requestOtpController)
app.post('/verify-otp', verifyOtpController)

// for social auth
app.post('/social/auth', socialLoginController)
// app.post('/change-password-with-otp', changePasswordWithOtpController)
// 



module.exports = app;