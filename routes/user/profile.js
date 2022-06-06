const express = require("express");
const app = express.Router();
const {
    uploadMainMediaController,
    uploadOtherMediaController} =  require('../../controllers/user/profile')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/profile/upload-main-media', verifyUsersToken, uploadMainMediaController)
app.post('/profile/upload-other-media', verifyUsersToken, uploadOtherMediaController)
// upload-other-media


module.exports = app;