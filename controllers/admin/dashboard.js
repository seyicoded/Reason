const {getDB} = require('../../db/index')
const db = getDB;

const getAll = async (req, res)=>{
    try{
        const admin = (await db.promise().query("SELECT * FROM admins"))[0];
        const active_admin = (await db.promise().query("SELECT * FROM admins WHERE status = 1"))[0];
        const blocked_admin = (await db.promise().query("SELECT * FROM admins WHERE status = 2"))[0];
        const inactive_admin = (await db.promise().query("SELECT * FROM admins WHERE status = 0"))[0];
        const user = (await db.promise().query("SELECT * FROM users"))[0];
        const inactive_user = (await db.promise().query("SELECT * FROM users WHERE status = 2"))[0];
        return res.status(200).json({
            status: true,
            message: 'success',
            data: {
                admin: admin,
                active_admin: active_admin,
                blocked_admin: blocked_admin,
                inactive_admin: inactive_admin,
                user: user,
                inactive_user: inactive_user
            }
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            status: false,
            message: 'an error occurred',
            error: error
        })
    }
}

module.exports = {
    getAll
}