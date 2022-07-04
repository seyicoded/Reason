const express = require("express");
const app = express.Router();
const {
    createBroadcast
} =  require('../../controllers/user/broadcast')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/broadcast/create', verifyUsersToken, createBroadcast)
// get
// update-location
// upload-other-media


module.exports = app;