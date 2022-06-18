const express = require("express");
const app = express.Router();
const {
    authNormalController,
    authPresenceController} =  require('../../controllers/pusher/auth')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/auth/pusher-other', verifyUsersToken, authNormalController)
app.post('/auth/pusher-presence', verifyUsersToken, authPresenceController)

module.exports = app;