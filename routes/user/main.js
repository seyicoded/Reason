const express = require("express");
const app = express.Router();
const {
    getPeopleController} =  require('../../controllers/user/main')

const {
    verifyUsersToken
    } = require('../../middlewares/authvet');

app.get('/main/get-people', verifyUsersToken, getPeopleController)

module.exports = app;