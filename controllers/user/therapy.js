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

const createSession = async(req, res)=>{
    try{
        const user_id = (await req.user).u_id;

        const {
            therapist_id,
            session_title,
            session_description,
        } = req.body

        const session_id = uuidv4();

        const result = await db.promise().query("INSERT INTO therapy_session (unique_code, client_id, provider_id, need, situation) VALUES (?, ?, ?, ?, ?)", [session_id, user_id, therapist_id, session_title, session_description])



        return res.status(200).json({
            status: true,
            message: 'successfully created',
            session_id: session_id,
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

const viewSessions = async (req, res)=>{
    try{
        const user_id = (await req.user).u_id;

        const result = await db.promise().query("SELECT * FROM therapy_session WHERE client_id = ? AND provider_id = ?", [user_id, user_id]);


        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: result,
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
    getAll,
    createSession,
    viewSessions
}