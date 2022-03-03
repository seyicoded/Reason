const {getDB} = require('../../db/index')
const db = getDB();
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

const signinController = async(req, res)=>{
    try {
        var {email, password} = req.body

        db.execute("SELECT * FROM users WHERE email = ?",[email],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'An error occurred',
                    error: err

                })    
            }

            console.log(results)

                
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: 'an error occurred',
            error: error
        })
    }
}

const signupController = async(req, res)=>{
    // console.log(req.body)
    
    try {
        var {email, first_name, last_name, phone, password} = req.body

        password = await bcrypt.hash(password, 10);

        db.execute("INSERT INTO users(email, phone, first_name, last_name, password) VALUES(?, ?, ?, ?, ?)",[email, phone, first_name, last_name, password],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'account not creatable',
                    error: err

                })    
            }

            if(results.affectedRows > 0){
                // get user data and encode

                return res.status(201).json({
                    status: true,
                    message: 'User created successfully',
                    data: [results]
                })
            }else{
                return res.status(500).json({
                    status: false,
                    message: 'User not created',
                    data: [results]
                })
            }
                
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: 'an error occurred',
            error: error
        })
    }
    
}

module.exports = {
    signinController,
    signupController
};