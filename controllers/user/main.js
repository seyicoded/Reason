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
    const Peoples = filterByInterest((await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [user_id]))[0], myData);

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

module.exports = {
    getPeopleController
}