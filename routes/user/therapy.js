const express = require("express");
const app = express.Router();
const {
    getAll} =  require('../../controllers/user/therapy')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/therapy/get', verifyUsersToken, getAll)
// get
// update-location
// upload-other-media


module.exports = app;