const express = require("express");
const app = express.Router();
const {signinController, signupController, resendEmailController, requestOtpController} =  require('../../controllers/user/auth')

app.post('/sign-in', signinController)
app.post('/sign-up', signupController)
app.post('/resend-email', resendEmailController)
app.post('/request-otp', requestOtpController)



module.exports = app;