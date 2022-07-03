const express = require("express");
const app = express.Router();
const {
    getMyChat,
    getSingleChat} =  require('../../controllers/user/chat')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/chat/get', verifyUsersToken, getMyChat)
app.get('/chat/get/:ll_id', verifyUsersToken, getSingleChat)
// get
// update-location
// upload-other-media


module.exports = app;