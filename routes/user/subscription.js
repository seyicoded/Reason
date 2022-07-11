const express = require("express");
const app = express.Router();
const {
    upgradeSubscription,
    getSubscription} =  require('../../controllers/user/subscription')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/subscription/upgrade', verifyUsersToken, upgradeSubscription)
app.get('/subscription', verifyUsersToken, getSubscription)
// get
// update-location
// upload-other-media


module.exports = app;