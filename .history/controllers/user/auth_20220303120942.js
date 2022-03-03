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

        db.execute("SELECT * FROM users",[],(err, results, fields)=>{
            console.log(err)
            console.log(results)
            console.log(fields)

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