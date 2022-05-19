const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');

const viewAll = async (req, res)=>{
    try{
        db.execute("SELECT * FROM admins", (err, results)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: err
                })
            }

            if(results.length > 0){
                return res.status(200).json({
                    status: true,
                    message: 'Admin successfully fetched',
                    results: results
                })
            }else{
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: 'error'
                })
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
    viewAll
}