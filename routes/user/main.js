const express = require("express");
const app = express.Router();
const {
    getPeopleController,
    sendLikeRequestController} =  require('../../controllers/user/main')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/main/get-people', verifyUsersToken, getPeopleController)
app.get('/main/send-like-request', verifyUsersToken, sendLikeRequestController)

module.exports = app;