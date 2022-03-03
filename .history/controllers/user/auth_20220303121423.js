const {getDB} = require('../../db/index')

const signinController = async(req, res)=>{
    console.log(req)
    console.log('req')
    return res.json({
        status: false,
        message: 'still working on it'
    })
}

const signupController = async(req, res)=>{
    // console.log(req.body)
    const db = getDB();
    try {
        const {email, first_name, last_name, phone, password} = req.body

        db.execute("INSERT INTO users(email, phone, first_name, last_name, password) VALUES(?, ?, ?, ?, ?)",[],(err, results, fields)=>{
            if(err){
                return res.status(500).json({
                    status: false,
                    message: 'account not creatable',
                    error: err

                })    
            }

            return res.status(201).json({
                status: false,
                message: 'still working on it'
            })    
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