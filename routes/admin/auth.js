const express = require("express");
const app = express.Router();
const {
    registerAdmin,
    loginAdmin
} =  require('../../controllers/admin/auth')

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.post('/admin/sign-up', verifyUsersToken, registerAdmin)
app.post('/admin/sign-in', loginAdmin)
// 

module.exports = app;