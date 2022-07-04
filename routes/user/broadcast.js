const express = require("express");
const app = express.Router();
const {
    createBroadcast,
    verifyBroadcast
} =  require('../../controllers/user/broadcast')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/broadcast/create', verifyUsersToken, createBroadcast)
app.post('/broadcast/verify', verifyUsersToken, verifyBroadcast)
// get
// update-location
// upload-other-media


module.exports = app;