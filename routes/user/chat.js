const express = require("express");
const app = express.Router();
const {
    getMyChat} =  require('../../controllers/user/chat')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/chat/get', verifyUsersToken, getMyChat)
// get
// update-location
// upload-other-media


module.exports = app;