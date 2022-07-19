const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');

const viewAll = async (req, res)=>{
    try{

        const data = (await db.promise().query("SELECT * FROM users", []))[0];

        const result = [];

        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element = data[key];

                const user_image = (await db.promise().query("SELECT * FROM users_images WHERE u_id = ?", [element.u_id]))[0];
                const user_media = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [element.u_id]))[0];
                
                result.push({
                    mainData: element,
                    user_image,
                    user_media
                })
            }
        }

        return res.status(200).json({
            status: true,
            message: 'Successfully Loaded',
            data: result
        })
    }catch(e){
        console.log(e)
        return res.status(500).json({
            status: false,
            message: 'An error occurred',
            error: e
        })
    }
}

const restrictUser = async (req, res)=>{
    try{
        const {id} = req.body
        const data = (await db.promise().query("UPDATE users SET status = 2 WHERE u_id = ?", []))[0];

        return res.status(200).json({
            status: true,
            message: 'Successfully Restricted'
        })

    }catch(e){
        console.log(e)
        return res.status(500).json({
            status: false,
            message: 'An error occurred',
            error: e
        })
    }
}

module.exports = {
    viewAll,
    restrictUser
}