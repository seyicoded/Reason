const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { initPusher } = require('../../resource/general');

const pusherObject = initPusher()

const authNormalController = async (req, res)=>{
    const user_id = (await req.user).u_id;

    const myData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [user_id]))[0][0];

    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const authReponse = pusherObject.authorizeChannel(socketId, channel);
    return res.send(authReponse);
}

const authPresenceController = async (req, res)=>{
    const user_id = (await req.user).u_id;

    const myData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [user_id]))[0][0];

    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const presenceData = {
        user_id: user_id,
        user_info: myData,
    };

    const authResponse = pusherObject.authorizeChannel(socketId, channel, presenceData);
    res.send(authResponse);
    
}

module.exports ={
    authNormalController,
    authPresenceController
}