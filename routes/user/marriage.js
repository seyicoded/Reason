const express = require("express");
const app = express.Router();
const {
    getMarriageRegStatus,
    getList,
    fillForm} =  require('../../controllers/user/marriage')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/marriage/reg-status', verifyUsersToken, getMarriageRegStatus)
app.get('/marriage/compatiable-list', verifyUsersToken, getList)
app.post('/marriage/form', verifyUsersToken, fillForm)
// app.get('/marriage', verifyUsersToken, getSubscription)
// get
// update-location
// upload-other-media


module.exports = app;