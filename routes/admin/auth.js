const express = require("express");
const app = express.Router();
const {
    registerAdmin,
    loginAdmin
} =  require('../../controllers/admin/auth')

app.post('/admin/sign-up', registerAdmin)
app.post('/admin/sign-in', loginAdmin)
// 

module.exports = app;