const express = require('express');
const app = express.Router();

const {
    viewAll,
    restrictUser
} = require('../../controllers/admin/users');

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.get('/admin/users/get', verifyUsersToken, viewAll)
app.post('/admin/users/restrict', verifyUsersToken, restrictUser)

module.exports = app;