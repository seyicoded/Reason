const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../../resource/general');

const getMarriageRegStatus = async ()=>{
    // check if marriage entry exist, if not, then return marriage entry not entered
    // if it exist, check if it's completely filled

    try {
        const user_id = (await req.user).u_id;

        const marriage = (await db.promise().query("SELECT * FROM marriage u_id = ?", [user_id]))[0]

        let msg = '';

        if(marriage.length > 0){
            const _marriage =marriage[0];

            if(_marriage.m_status == 1){
                msg = 'marriage entry filled';
            }else{
                msg = 'marriage entry not fully filled, fill again';
            }

            return res.status(200).json({
                status: true,
                message: msg,
                data: _marriage,
            })
        }else{
            msg = 'marriage entry not filled yet'

            return res.status(200).json({
                status: false,
                message: msg
            })
        }
    } catch (error) {
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getMarriageRegStatus
}