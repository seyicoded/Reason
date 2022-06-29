const express = require("express");
const app = express.Router();
const {
    authNormalController,
    authPresenceController} =  require('../../controllers/pusher/auth')

const {
    fcmRegisterController} =  require('../../controllers/fcm/auth')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/auth/pusher-other', verifyUsersToken, authNormalController)
app.post('/auth/pusher-presence', verifyUsersToken, authPresenceController)
app.post('/auth/register-fcm-token', verifyUsersToken, fcmRegisterController)
// register-fcm-token

module.exports = app;