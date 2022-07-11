const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');

const upgradeSubscription = async (req, res) => {
    // first get previous expiry date, 
    // if exist and not expire then add a month to it
    // else just add a month from now and use as expiry date
    // update status to 1
    try{
        const user_id = (await req.user).u_id;
        
        const userData = (await db.promise().query("SELECT * FROM users WHERE u_id = ?", [user_id]))[0][0];
        const expireDate = userData.subscription_expiry;
        const todayDate = new Date();
        let newDate;

        if(expireDate == null){
            // doesn't exist yet
            newDate = todayDate;
            newDate.setDate(newDate.getDate() + 30)
        }else{
            const expireDate_ = new Date(expireDate);
            if((expireDate_).getTime() < todayDate.getTime()){
                // expire
                newDate = todayDate;
                newDate.setDate(newDate.getDate() + 30)
            }else{
                // still valid
                newDate = expireDate_;
                newDate.setDate(newDate.getDate() + 30)
            }
        }

        const result = (await db.promise().query("UPDATE users SET subscription_expiry = ?, subscription_status = 1 WHERE u_id = ?", [newDate.toISOString(), user_id]))[0];

        if(result.affectedRows > 0){
            return res.status(200).json({
                status: true,
                message: 'successfully upgraded',
            })
        }else{
            return res.status(200).json({
                status: false,
                message: 'An error occurred',
                data: result,
            })
        }

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
    upgradeSubscription
}