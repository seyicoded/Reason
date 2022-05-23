const express = require('express');
const app = express.Router();

const {
    viewAll,
    deleteAdmin
} = require('../../controllers/admin/profile');

const {
    verifyUsersToken
} = require('../../middlewares/authvet');

app.get('/admin/profile/view-all', verifyUsersToken, viewAll)
app.delete('/admin/delete-profile', verifyUsersToken, deleteAdmin)

module.exports = app;