const {getDesign} = require('./template/email/index.js')
const nodemailer = require("nodemailer");
require('dotenv').config()	

const sendMail = async(to, subject, message)=>{
    try{

        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: process.env.MAIL_SECURE, // true for 465, false for other ports
            auth: {
              user: process.env.MAIL_ADDRESS, // generated ethereal user
              pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });

        return await transporter.sendMail({
            from: '"NO-REPLY " <'+process.env.MAIL_ADDRESS+'>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: getDesign({subject, message}), // plain text body
            html: getDesign({subject, message}), // html body
        });
    }catch(e){
        return null;
        console.log(e)
    }
    
}

const sendSMS = async()=>{

}

module.exports = {
    sendMail,
    sendSMS
}