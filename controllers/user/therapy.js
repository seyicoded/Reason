const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { notifyPartiesOfMessage, getOnlineStatus, getDistanceInMeter, filterByInterest, notifyPartiesOfMerged, PER_BROADCAST_COST, PAYSTACK_SECRET_KEY, sendPushNoti, } = require('../../resource/general');

const { initPusher } = require('../../resource/general');
const { default: axios } = require('axios');

const pusherObject = initPusher()
const storageRef = firebase.storage().bucket('gs://reasnsapp.appspot.com');

const getAll = async (req, res)=>{
    // get list of user that's a therapist
    try{
        const user_id = (await req.user).u_id;

        const therapists = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id != ? AND user_data.is_therapist = ?", [user_id, true]))[0];

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: therapists,
        })
    }catch(e){
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getAll
}