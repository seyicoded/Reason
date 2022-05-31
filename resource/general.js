const {getDesign} = require('./template/email/index.js')
const nodemailer = require("nodemailer");
const axios = require('axios').default;
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

const sendSMS = async({to, body})=>{
    try {
        // for now sms info is static
        var phone = to.toString();
  
        // filter phone
        // phone = phone.replaceAll("+",'');
        if((phone.substring(0, 1)).toString() == "+"){
          phone = phone.substr(1);
        }
  
        if(parseInt(phone.substring(0, 1)) == 0){
          phone = "234"+phone.substr(1);
        }

        console.log(phone)
        
        const otp =await axios({
          method: "POST",
          url: "https://api.ng.termii.com/api/sms/send",
          data: {
            "to": phone,
            "from": "N-Alert",
            "type": "plain",
            "sms": body,
            "channel": "dnd",
            "termii_api_key": process.env.TERMII_API_KEY,
          }
        })
        // resolve(otp);
      } catch (error) {
        console.log(error);
        // reject(error);
    }
}

module.exports = {
    sendMail,
    sendSMS
}