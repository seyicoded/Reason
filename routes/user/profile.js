const express = require("express");
const app = express.Router();
const {
    uploadMainMediaController,
    uploadOtherMediaController,
    deleteOtherMediaController,
    updateLocationController,
    getController} =  require('../../controllers/user/profile')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.post('/profile/upload-main-media', verifyUsersToken, uploadMainMediaController)
app.post('/profile/upload-other-media', verifyUsersToken, uploadOtherMediaController)
app.delete('/profile/delete-other-media', verifyUsersToken, deleteOtherMediaController)
app.post('/profile/update-location', verifyUsersToken, updateLocationController)
app.post('/profile/get', verifyUsersToken, getController)
// get
// update-location
// upload-other-media


module.exports = app;