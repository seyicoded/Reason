const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');
const {generateJwtToken, generateJwtTokenForEmailValidate, verify_token_extract} = require('../../middlewares/jwt')
const {sendMail} = require('../../mailer')

const registerAdmin = async (req, res)=>{
    try{
        const {email, password, name, role, status} = req.body;
        const statuss = (status) ? status:0;
        const hashpassword = await bcrypt.hash(password, 10);
        
        db.execute("INSERT INTO admins(email, password, name, role, status) VALUES(?, ?, ?, ?, ?)",[email, hashpassword,name, role, statuss],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: err
                })
            }

            if(results.affectedRows > 0){
                return res.status(201).json({
                    status: true,
                    message: 'Admin successfully created',
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

const loginAdmin = async (req, res)=>{
    try{
        const {email, password} = req.body;

        db.execute("SELECT * FROM admins WHERE email = ?",[email], (err, results)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: err
                })
            }

            // check if data exist
            if(results.length > 0){
                const result = results[0];
                
                (async()=>{
                    const isValidPassword = await bcrypt.compare(password, result.password);
                    if(isValidPassword){
                        return res.status(200).json({
                            status: true,
                            message: 'Login Successful',
                            token: generateJwtToken(result),
                            data: result,
                            isAccountValidated: ((result.status == 1) ? true: false),
                            isAccountBlocked: ((result.status > 1) ? true: false),
        
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
                    message: 'email not found',
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
    registerAdmin,
    loginAdmin
}