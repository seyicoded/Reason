const {getDB} = require('../../db/index')
const db = getDB;
const bcrypt = require('bcryptjs');
const {generateJwtToken, generateJwtTokenForEmailValidate, verify_token_extract} = require('../../middlewares/jwt')
const {sendMail} = require('../../mailer')
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

module.exports = {
    signinController,
    signupController,
    resendEmailController,
    verify_account
};