const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');

const fcmRegisterController = async (req, res)=>{
    const user_id = (await req.user).u_id;
    const {fcm_token, device_type} = req.body
    
    // logic to implement,
    /*
        check if token exist, if it does, just update the user id with the new id
        and 
        if token doesn't exist, then just create new
    */

    const record_ = (await db.promise().query("SELECT * FROM push_noti WHERE device_token = ?", [fcm_token]))[0]
    if((record_).length != 0){
        // record exist
        const r = await db.promise().query("UPDATE push_noti SET account_id = ? WHERE device_token = ?", [user_id, fcm_token])
        
        if(r[0].affectedRows == 1){
            return res.status(200).json({
                status: true,
                message: 'Updated Successfully',
            })
        }else{
            return res.status(400).json({
                status: false,
                message: 'An Error Occurred',
            })
        }
    }

    // no record exist for token
    const r = await db.promise().query("INSERT INTO push_noti(account_mode, account_id, device_type, device_token) VALUES(?, ?, ?, ?)", ['user', user_id, device_type, fcm_token])
    if(r[0].affectedRows == 1){
        return res.status(200).json({
            status: true,
            message: 'Entry Created Successfully',
        })
    }else{
        return res.status(400).json({
            status: false,
            message: 'An Error Occurred',
        })
    }
    

    
    return res.send('reach')
    
}

module.exports ={
    fcmRegisterController
}