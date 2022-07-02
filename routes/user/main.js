const express = require("express");
const app = express.Router();
const {
    getPeopleController,
    sendLikeRequestController,
    getActiveLikeRequestController} =  require('../../controllers/user/main')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/main/get-people', verifyUsersToken, getPeopleController)
app.get('/main/send-like-request', verifyUsersToken, sendLikeRequestController)
app.get('/main/get-sent-like-request-list', verifyUsersToken, getActiveLikeRequestController)

module.exports = app;