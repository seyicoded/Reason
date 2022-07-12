const express = require("express");
const app = express.Router();
const {
    getAll,
    createSession,
    viewSessions} =  require('../../controllers/user/therapy')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/therapy/get', verifyUsersToken, getAll)
// view-sessions
app.get('/therapy/view-sessions', verifyUsersToken, viewSessions)

app.post('/therapy/create', verifyUsersToken, createSession)
// get
// update-location
// upload-other-media


module.exports = app;