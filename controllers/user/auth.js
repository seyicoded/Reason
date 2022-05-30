const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');
const {generateJwtToken, generateJwtTokenForEmailValidate, verify_token_extract} = require('../../middlewares/jwt')
const {sendMail} = require('../../mailer')
const jwt = require('jsonwebtoken');
require('dotenv').config()
// const url = require('url');

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
                            data: results[0],
                            isAccountValidated: ((results[0].status == 1) ? true: false)
        
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
        var {email, first_name, last_name, phone, password, dob, gender, newsletter} = req.body

        password = await bcrypt.hash(password, 10);

        console.log(password)

        db.execute("INSERT INTO users(email, phone, first_name, last_name, password, dob, gender, newsletter) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",[email, phone, first_name, last_name, password, dob, gender, newsletter],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'account not creatable, email may already exist',
                    error: err

                })    
            }

            if(results.affectedRows > 0){
                // get user data and encode
                db.execute("SELECT * FROM users WHERE email = ?",[email],(err, resultss, fields)=>{
                    
                    // console.log(resultss)
                    if( resultss.length > 0 ){
                        (async()=>{
                            // const isValidPassword = await bcrypt.compare(password, resultss[0].password);
                            if(true){
                                const token = generateJwtToken(resultss[0]);
                                try {
                                    await sendMail({
                                        to: resultss[0].email,
                                        subject: 'Account Verification required',
                                        html: `
                                            <h1 style='text-align: center'>Activate Account</h1>
                                            <a href='${'http://'+(req.hostname)}/user/account-validate/${generateJwtTokenForEmailValidate(resultss[0])}'>click here to activate account, valid for 2 hours, request another if expired</a>
                                        `,
                                    })                                    
                                } catch (error) {
                                    console.log(error)
                                }

                                return res.status(200).json({
                                    status: true,
                                    message: 'Account Successfully Created',
                                    token: token,
                                    data: resultss[0],
                                    isAccountValidated: ((resultss[0].status == 1) ? true: false)
                
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

                // return res.status(201).json({
                //     status: true,
                //     message: 'User created successfully',
                //     data: [results]
                // })
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

const resendEmailController = async(req, res)=>{
    
    try{
        const {email} = req.body;

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
                    try {
                        await sendMail({
                            to: results[0].email,
                            subject: 'Account Verification required',
                            html: `
                                <h1 style='text-align: center'>Activate Account</h1>
                                <a href='${'http://'+(req.hostname)}/user/account-validate/${generateJwtTokenForEmailValidate(results[0])}'>click here to activate account, valid for 2 hours, request another if expired</a>
                            `,
                        })  
                        
                        return res.status(200).json({
                            status: true,
                            message: 'Request Sent to Mail',
                            data: results[0],
                            isAccountValidated: ((results[0].status == 1) ? true: false)
        
                        })
                    } catch (error) {
                        console.log(error)
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


    }catch(e){
        console.log(error)
        return res.status(500).json({
            status: false,
            message: 'an error occurred',
            error: error
        })
    }
    


}

const verify_account = async(req,res)=>{
    try{
        const token = req.params.token;
        const data = verify_token_extract(token)

        // console.log(token)
        // console.log(data)

        const u_id = data.u_id;

        db.execute("UPDATE users SET status = 1 WHERE u_id = ?", [u_id], (err, results, fields)=>{
            if(err){
                return res.status(200).json({
                    status: false,
                    message: 'An error occurred',
                })    
            }

            console.log('reached')

            return res.send(`
                    <script>
                        alert('Account Successfully Verified');
                        document.write('Account Successfully Verified');
                    </script>
                `);
        });
    }catch(e){
        console.log(e)
    }
    
}

const requestOtpController = async(req, res)=>{
    try{
        const {phone, email} = req.body;
        // return res.send(`${phone}- ${email}`);

        db.execute("SELECT * FROM otp_session WHERE phone = ? AND email = ?", [phone, email], (err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'An error occurred',
                    error: err

                })    
            }

            if( results.length > 0 ){
                // update otp information
                const code = `${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}`;
                // expire in 2 hours
                const expire = jwt.sign({email, phone}, process.env.JWT_SECRET_TOKEN_SECRET, {expiresIn: '2h'});
                const status = 0;

                // send otp to both email and phone

                db.execute("UPDATE otp_session SET otp = ?, expire = ?, status = ? WHERE phone = ? AND email = ?", [code, expire, status, phone, email], (err, results, fields)=>{
                    if(err){
                        return res.status(500).json({
                            status: false,
                            message: 'An error occurred',
                            error: err

                        })    
                    }

                    return res.status(200).json({
                        status: true,
                        message: 'OTP Sent to both Email and Phone',
                        expire: 'In 2 hours',
                    })
                });

                return res.status(200).json({
                    status: true,
                    message: 'OTP Sent to both Email and Phone',
                    expire: 'In 2 hours',
                })
                
            }else{
                // create otp information
                const code = `${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}`;
                // expire in 2 hours
                const expire = jwt.sign({email, phone}, process.env.JWT_SECRET_TOKEN_SECRET, {expiresIn: '2h'});
                const status = 0;

                // send otp to both email and phone

                db.execute("INSERT INTO otp_session (phone, email, otp, expire, status) VALUES (?,?,?,?,?)", [phone, email, code, expire, status], (err, results, fields)=>{
                    if(err){
                        return res.status(500).json({
                            status: false,
                            message: 'An error occurred',
                            error: err

                        })    
                    }

                    return res.status(200).json({
                        status: true,
                        message: 'OTP Sent to both Email and Phone',
                        expire: 'In 2 hours',
                    })
                });
                   
            }


        });

        // db.execute("SELECT * FROM users WHERE email = ?",[email],(err, results, fields)=>{
        

        //     // console.log(results)
        //     if( results.length > 0 ){
        //         (async()=>{
        //             // generate random code
        //             const code = `${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}`;
        //             db.execute("UPDATE users SET code = ? WHERE email = ?", [code, email], (errs, resultss)=>{
        //                 if(errs){
        //                     return res.status(500).json({
        //                         status: false,
        //                         message: 'An error occurred',
        //                         error: err
            
        //                     })    
        //                 }

        //                 // send mail and return success
        //                 (async()=>{
        //                     try {
        //                         await sendMail({
        //                             to: email,
        //                             subject: 'OTP FOR ACCOUNT RECOVERY',
        //                             html: `
        //                                 <h1 style='text-align: center'>USE THE CODE TO CHANGE YOUR PASSWORD</h1>
        //                                 <div style='text-align: center; font-weight: bolder; font-size: 23px'>${code}</div>
        //                             `,
        //                         })  
                                
        //                         return res.status(200).json({
        //                             status: true,
        //                             message: 'OTP Sent to Mail'
                
        //                         })
        //                     } catch (error) {
        //                         console.log(error)
        //                     }
        //                 })()
        //             });
        //         })()
                
        //     }else{
        //         return res.status(500).json({
        //             status: false,
        //             message: 'User doesn\'t exist',
        //             error: []

        //         })  
        //     }

                
        // });
    }catch(e){
        console.log(error)
        return res.status(500).json({
            status: false,
            message: 'an error occurred',
            error: error
        })
    }
}

const changePasswordWithOtpController = async(req, res)=>{
    try{
        
        const {email, new_password, otp} = req.body;
        var password = await bcrypt.hash(new_password, 10);

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
                    const isOTPVALID = (otp == results[0].code) ? true:false;
                    if(isOTPVALID){
                        // update password and clear otp
                        var new_otp = 0;
                        password = password;
                        
                        db.execute("UPDATE users SET code = ?, password = ? WHERE email = ?", [new_otp, password, email], (errss, resultss)=>{
                            if(err){
                                return res.status(500).json({
                                    status: false,
                                    message: 'An error occurred',
                                    error: err
                
                                })    
                            }

                            return res.status(200).json({
                                status: true,
                                message: 'Password Changed Successfully',
                                token: generateJwtToken(results[0]),
                                data: results[0],
                                isAccountValidated: ((results[0].status == 1) ? true: false)
            
                            })


                        });
                    }else{
                        return res.status(500).json({
                            status: false,
                            message: 'Otp is Invalid',
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

    }catch(e){
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
    signupController,
    resendEmailController,
    verify_account,
    requestOtpController,
    changePasswordWithOtpController
};