const express = require("express");
const app = express.Router();
const {
    getPeopleController,
    sendLikeRequestController,
    getActiveLikeRequestController,
    acceptLikeRequestController,
    rejectLikeRequestController} =  require('../../controllers/user/main')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/main/get-people', verifyUsersToken, getPeopleController)
app.post('/main/send-like-request', verifyUsersToken, sendLikeRequestController)
app.post('/main/get-sent-like-request-list', verifyUsersToken, getActiveLikeRequestController)
app.post('/main/accept-like-request', verifyUsersToken, acceptLikeRequestController)
app.post('/main/reject-like-request', verifyUsersToken, rejectLikeRequestController)

module.exports = app;