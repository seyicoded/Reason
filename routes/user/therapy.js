const express = require("express");
const app = express.Router();
const {
    getAll,
    createSession} =  require('../../controllers/user/therapy')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/therapy/get', verifyUsersToken, getAll)
app.get('/therapy/create', verifyUsersToken, createSession)
// get
// update-location
// upload-other-media


module.exports = app;