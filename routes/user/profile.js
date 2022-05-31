const express = require("express");
const app = express.Router();
const {
    uploadMainMediaController} =  require('../../controllers/user/profile')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/profile/upload-main-media', verifyUsersToken, uploadMainMediaController)


module.exports = app;