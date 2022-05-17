const express = require("express");
const app = express.Router();
const {
    registerAdmin
} =  require('../../controllers/admin/auth')

app.post('/admin/sign-up', registerAdmin)
// 

module.exports = app;