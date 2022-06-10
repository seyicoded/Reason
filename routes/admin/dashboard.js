const express = require('express');
const app = express.Router();

const {
    getAll,
} = require('../../controllers/admin/dashboard');

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.get('/admin/dashboard/get-all', verifyUsersToken, getAll)

module.exports = app;