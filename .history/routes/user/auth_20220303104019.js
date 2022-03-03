const express = require("express");
const app = express.Router();
const {signinController, signupController} =  require('../../controllers/user/auth')

app.post('/sign-in', signinController)
app.post('/sign-up', signupController)

module.exports = app;