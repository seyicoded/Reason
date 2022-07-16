const express = require('express');
const app = express.Router();

const {
    viewAll
} = require('../../controllers/admin/users');

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.get('/admin/users/get', verifyUsersToken, viewAll)

module.exports = app;