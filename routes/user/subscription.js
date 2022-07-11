const express = require("express");
const app = express.Router();
const {
    upgradeSubscription} =  require('../../controllers/user/subscription')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/subscription/upgrade', verifyUsersToken, upgradeSubscription)
// get
// update-location
// upload-other-media


module.exports = app;