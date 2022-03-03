const {getDB} = require('../../db/index')
const db = getDB();
const bcrypt = require('bcryptjs');
const {generateJwtToken} = require('../../middlewares/jwt')

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

            // console.log(results)
            if( results.length > 0 ){
                (async()=>{
                    const isValidPassword = await bcrypt.compare(password, results[0].password);
                    if(isValidPassword){
                        return res.status(200).json({
                            status: true,
                            message: 'Login Successful',
                            token: generateJwtToken(results[0]),
                            data: results[0]
        
                        })
                    }else{
                        return res.status(500).json({
                            status: false,
                            message: 'Email or Password MisMatch',
                            error: []
        
                        })  
                    }
                })()
                
            }else{
                return res.status(500).json({
                    status: false,
                    message: 'User doesn\'t exist',
                    error: []

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

const signupController = async(req, res)=>{
    // console.log(req.body)
    
    try {
        var {email, first_name, last_name, phone, password} = req.body

        password = await bcrypt.hash(password, 10);

        console.log(password)

        db.execute("INSERT INTO users(email, phone, first_name, last_name, password) VALUES(?, ?, ?, ?, ?)",[email, phone, first_name, last_name, password],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'account not creatable, email may already exist',
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