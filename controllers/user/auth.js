const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');
const {generateJwtToken, generateJwtTokenForEmailValidate, verify_token_extract} = require('../../middlewares/jwt')
const {sendMail, sendSMS} = require('../../resource/general.js')
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
                        // check if user is restricted
                        if(results[0].status > 1){
                            // user is restricted
                            return res.status(200).json({
                                status: true,
                                message: 'Login Successful but user retricted',
                                token: null,
                                data: null,
                                isAccountValidated: ((results[0].status == 0) ? true: false)
            
                            })

                        }
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
                
                const message= `Use ${code} to verify yourself on the Reasns app`;

                // send otp to both email and phone
                (async()=>{
                    console.log(await sendMail(email, "OTP From Reasns", message));
                    await sendSMS({to: phone, body: message});

                    db.execute("UPDATE otp_session SET otp = ?, expire = ?, status = ? WHERE phone = ? AND email = ?", [code, expire, status, phone, email], (err1, results1, fields1)=>{
                        if(err1){
                            return res.status(500).json({
                                status: false,
                                message: 'An error occurred',
                                error: err1
    
                            })    
                        }
    
                        return res.status(200).json({
                            status: true,
                            message: 'OTP Sent to both Email and Phone',
                            expire: 'In 2 hours',
                        })
                    });
                })()
                
            }else{
                // create otp information
                const code = `${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}${Math.floor((Math.random() * 9) + 1)}`;
                // expire in 2 hours
                const expire = jwt.sign({email, phone}, process.env.JWT_SECRET_TOKEN_SECRET, {expiresIn: '2h'});
                const status = 0;
                
                const message= `Use ${code} to verify yourself on the Reasns app`;

                // send otp to both email and phone
                (async()=>{
                    await sendMail(email, "OTP From Reasns", message)
                    await sendSMS({to: phone, body: message});

                    db.execute("INSERT INTO otp_session (phone, email, otp, expire, status) VALUES (?,?,?,?,?)", [phone, email, code, expire, status], (err1, results1, fields)=>{
                        if(err1){
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
                })()

                   
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

const verifyOtpController = async (req, res)=>{
    const {phone, email, otp} = req.body;

    db.execute("SELECT * FROM otp_session WHERE phone = ? AND email = ? AND otp = ?", [phone, email, otp], (err, results, fields)=>{
        if(err){
            return res.status(500).json({
                status: false,
                message: 'An error occurred',
                error: err

            })    
        }

        if( results.length > 0 ){
            if(results[0].status == 0){
                // update otp information
                const status = 1;

                // check if otp is expired
                try{
                    const expire = jwt.verify(results[0].expire, process.env.JWT_SECRET_TOKEN_SECRET);
                }catch(e){
                    // assuming otp is expired
                    return res.status(500).json({
                        status: false,
                        message: 'OTP Already Expired',
                        error: []
                    })  
                }

                db.execute("UPDATE otp_session SET status = ? WHERE phone = ? AND email = ?", [status, phone, email], (err1, results1, fields1)=>{
                    if(err1){
                        return res.status(500).json({
                            status: false,
                            message: 'An error occurred',
                            error: err

                        })    
                    }

                    return res.status(200).json({
                        status: true,
                        message: 'OTP Verified',
                    })
                });
            }else{
                return res.status(500).json({
                    status: false,
                    message: 'OTP Already Used',
                    error: []
                })  
            }
        }else{
            return res.status(500).json({
                status: false,
                message: 'Invalid OTP',
                error: []

            })  
        }

    });

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

const socialLoginController = async (req, res)=>{
    try{
        // social login checker
        const value = req.body.value;
        const mode = req.body.mode;

        console.log(`${value}, ${mode}`)

        // start
        db.execute("SELECT * FROM users WHERE email=? OR phone=?",[value, value],(err, results, fields)=>{
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
                    const isValidPassword = true;
                    if(isValidPassword){
                        // check if user is restricted
                        if(results[0].status > 1){
                            // user is restricted
                            return res.status(200).json({
                                status: true,
                                message: 'Login Successful but user retricted',
                                token: null,
                                data: null,
                                isAccountValidated: ((results[0].status == 0) ? true: false)
            
                            })

                        }
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
                            message: 'Email or Phone not registered',
                            error: []
        
                        })  
                    }
                })()
                
            }else{
                console.log(results)
                return res.status(500).json({
                    status: false,
                    message: 'User doesn\'t exist',
                    error: []

                })  
            }

                
        });
        // stop
        
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
    changePasswordWithOtpController,
    verifyOtpController,
    socialLoginController
};