const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { getOnlineStatus, getDistanceInMeter, filterByInterest } = require('../../resource/general');

const { initPusher } = require('../../resource/general');

const pusherObject = initPusher()

const getPeopleController = async (req, res)=>{
    // get my profile first
    const user_id = (await req.user).u_id;

    const myData = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [user_id]))[0][0];

    // my latitude and longitude
    const myLatitude = myData.lat;
    const myLongitude = myData.lng;

    // get all people
    const isSorting = req.body.isSorting;

    let returns = [];
    const Peoples = filterByInterest((await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id != ?", [user_id]))[0], myData);

    if(isSorting == 'true'){
        // sort it
        return getSortedPeople(req, res, myData, myLatitude, myLongitude, Peoples);
    }

    // just don't sort it

    // const Peoples = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id != ?", [user_id]))[0];

    for (let index = 0; index < Peoples.length; index++) {
        const element = Peoples[index];
        delete element.main_image;
        const other_media = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [element.u_id]))[0];

        element.medias = other_media;
        element.isOnline = await getOnlineStatus(pusherObject, element.u_id);
        element.distanceBetweenMe = await getDistanceInMeter({
            lat: myLatitude,
            lon: myLongitude
        }, {
            lat: element.lat,
            lon: element.lng
        })

        // console.log(element)
        returns[index] = element
    }

    return res.status(200).json({
        status: true,
        message: 'successfully fetched',
        data: returns,
    })
    
}

const getSortedPeople = async (req, res, myData, myLatitude, myLongitude, Peoples)=>{
    let returns = [];

    // start
    
    // stop

    return res.status(200).json({
        status: true,
        message: 'successfully fetched',
        data: returns,
    })
}

const sendLikeRequestController = async (req, res)=>{
    // logic
    
    try{
        const user_id = (await req.user).u_id;
        const {user_id: reciever_id} = req.body

        // check if same entry already exist:: throw success error of already linked
        // check if user(me) already linked by other person:: check if pending then merge while ignore 
        // else create new entry attributed to pending

        // checker 1
        const entry_checker_1 = await db.promise().query("SELECT * FROM like_linker WHERE sender_id= ? AND reciever_id = ?", [user_id, reciever_id])[0];
        if((entry_checker_1).length != 0){
            // exact entry of user trying to like the other user exist
            return res.status(200).json({
                status: true,
                newlyMerged: false,
                message: 'Already sent liked request in the past',
            })
        }

        // checker 2
        const entry_checker_2 = await db.promise().query("SELECT * FROM like_linker WHERE sender_id= ? AND reciever_id = ?", [reciever_id, user_id])[0];
        if((entry_checker_2).length != 0){
            // exact entry of user already liked by other user exist, update entry and merge them
            // check if existing data is pending process merging
            const _dt = entry_checker_2[0];
            if(parseInt(_dt.status) == 0){
                // process merging
                const r = await db.promise().query("UPDATE like_linker SET status = ? WHERE ll_id = ?", [1, _dt.ll_id])[0]

                try{
                    // send push notification to receiver
                }catch(e){}
                return res.status(200).json({
                    status: true,
                    newlyMerged: true,
                    message: 'Already merged with user',
                })
            }else{
                return res.status(200).json({
                    status: true,
                    newlyMerged: false,
                    message: 'Already merged with user',
                })
            }
            
        }

        // create
        const r = await db.promise().query("INSERT INTO like_linker(sender_id, reciever_id, status) VALUES(?, ?, ?)", [user_id, reciever_id, 1])[0]
        if(r.affectedRows > 0){
            // success
            // send notification
            return res.status(200).json({
                status: true,
                newlyMerged: false,
                message: 'Request sent to user',
            })
        }else{
            return res.status(400).json({
                status: true,
                newlyMerged: false,
                message: 'An error occurred',
            })

        }

    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const getActiveLikeRequestController = async (req, res)=>{
    try{
        const user_id = (await req.user).u_id;

        const _data = (await db.promise().query("SELECT * FROM like_linker WHERE reciever_id = ? AND status = ?", [user_id, 0]))[0];

        console.log(_data)

        return res.status(200).json({
            status: true,
            data: _data,
            message: 'Successfully fetched',
        })
    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const acceptLikeRequestController = async (req, res)=>{
    try{
        const user_id = (await req.user).u_id;
        const {ll_id} = req.body

        const r = await db.promise().query("UPDATE like_linker SET status = ? WHERE ll_id = ?", [1, _dt.ll_id])[0]

        try{
            // send push notification to receiver
        }catch(e){}

        return res.status(200).json({
            status: true,
            newlyMerged: true,
            message: 'Merged successfully, Chat now active',
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
    getPeopleController,
    sendLikeRequestController,
    getActiveLikeRequestController,
    acceptLikeRequestController
}