const express = require("express");
const app = express.Router();
const {signinController} =  require('../../controllers/user/auth')

app.post('/sign-in', signinController)

module.exports = app;