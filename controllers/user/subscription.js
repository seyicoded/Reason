const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../../resource/general');

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

        const result = (await db.promise().query("UPDATE users SET subscription_expiry = ?, subscription_status = 1, has_notify = 0 WHERE u_id = ?", [newDate.toISOString(), user_id]))[0];

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

const notifyUser = async (id, type, data)=>{
    try{
        let email = data.email;
        let subject = '';
        let msg = '';
        switch (type) {
            case "expired":
                subject = 'Your Subscription has expired';
                msg = 'To continue enjoying premium features on our application you\'re required to re-subscribe in other to stay connected';
                break;

            case "a_week_remaining":
                subject = 'Your Subscription would soon expire';
                msg = 'To continue enjoying premium features on our application you\'re required to re-subscribe in other to stay connected';
                break;
        
            default:
                break;
        }

        await sendMail(email, subject, msg)
    }catch(e){
        console.log(e)
    }
}

const cronSubscriptionChecker = async () => {
    // loop throught all active users with a subsription,
    // check if the subscription is valid, if not then de-activate it, also if it's less than let's say a week, let's notify the user if not notified, and if notify, then update to notify
    try{
        const data = (await db.promise().query("SELECT * FROM users WHERE subscription_status = 1", []))[0]
        for (let index = 0; index < data.length; index++) {
            const _data = data[index]
            const expireDate = new Date(_data.subscription_expiry);
            const todayDate = new Date();
            if(expireDate.getTime() < todayDate.getTime()){
                // expired
                await db.promise().query("UPDATE users SET subscription_status = 0 WHERE u_id = ?", [_data.u_id]);
                notifyUser(_data.u_id, "expired", _data)
            }else{
                // compare date if 
                const dateRemaining = parseInt(expireDate.getTime()) - parseInt(todayDate.getTime());
                // presently a week in millisecond
                const threshold = 604800000;
                if(dateRemaining < threshold){
                    notifyUser(_data.u_id, "a_week_remaining", _data)
                    await db.promise().query("UPDATE users SET has_notify = 1 WHERE u_id = ?", [_data.u_id]);
                }
            }
        }
    }catch(e){
        console.log(e)
    }
}

const getSubscription = async (req, res)=>{
    try{
        const user_id = (await req.user).u_id;
        
        const userData = (await db.promise().query("SELECT * FROM users WHERE u_id = ?", [user_id]))[0][0];
        let result = {
            subscription: (parseInt(userData.subscription_status) == 0) ? 'normal' : 'premium',
            expire: userData.subscription_expiry,
        };

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
    upgradeSubscription,
    cronSubscriptionChecker,
    getSubscription
}