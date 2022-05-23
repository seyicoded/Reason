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
                    results: results,
                    count: results.length
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

const deleteAdmin = async (req, res)=>{
    try{
        const {id} = req.body;
        db.execute("DELETE FROM admins WHERE a_id = ?", [id], (err, results)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: err
                })
            }

            if(results.affectedRows > 0){
                return res.status(200).json({
                    status: true,
                    message: 'Admin successfully Deleted',
                    results: results,
                    count: results.length
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
    viewAll,
    deleteAdmin
}