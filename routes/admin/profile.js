const express = require('express');
const app = express.Router();

const {
    viewAll
} = require('../../controllers/admin/profile');

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.get('/admin/profile/view-all', verifyUsersToken, viewAll)

module.exports = app;