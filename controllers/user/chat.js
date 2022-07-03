const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { getOnlineStatus, getDistanceInMeter, filterByInterest, notifyPartiesOfMerged } = require('../../resource/general');

const { initPusher } = require('../../resource/general');

const pusherObject = initPusher()

const getMyChat = async (req, res)=>{
    // get all list of active lik_linker
    // loop through it and get the id of the other party and get the user info
    // loop through chat and get the chats
    try{
        const user_id = (await req.user).u_id;
        const chatData = []
        const myData = (await db.promise().query("SELECT * FROM like_linker WHERE sender_id LIKE '%?%' && reciever_id LIKE '%?%' && status = 1", [user_id, user_id]))[0];

        for (let index = 0; index < myData.length; index++) {
            const element = myData[index];
            const other_id = element.sender_id == user_id ? element.reciever_id : element.sender_id;
            const other_data = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [other_id]))[0][0];
            // const other_media = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [other_id]))[0];
            const chat = (await db.promise().query("SELECT * FROM chat WHERE ll_id = ? AND status = 1", [element.ll_id]))[0];
            chatData[index] = {
                ll_id: element.ll_id,
                other_data,
                // other_media,
                chat
            }
        }

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: chatData,
        })

    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getMyChat
}