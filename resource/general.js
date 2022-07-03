const {getDesign} = require('./template/email/index.js')
const nodemailer = require("nodemailer");
const axios = require('axios').default;
const Distance = require('geo-distance');
const Pusher = require('pusher');
const firebase = require('./firebase')
require('dotenv').config()

var pusher = null;
const pusher_presence_channel_name = "presence-online";

const initPusher = ()=>{
  pusher = new Pusher({
    appId: "1425412",
    key: "2c664ca34e33663c572f",
    secret: "c1c8262a2473c99993b0",
    cluster: "mt1",
    useTLS: true
  });

  return pusher;
}

const filterByInterest = (PeoplesData, myData)=>{
  // automatically filtering my interest using logic of like 
  return PeoplesData;
}

const getOnlineStatus = async (pusherObject, u_id)=>{
    const presence_user = await pusherObject.get({ path: `/channels/${pusher_presence_channel_name}/users` })
    console.log(presence_user)
    // console.log(presence_user.users)
    try{
      presence_user.users.forEach(user=>{
        if(user.id == u_id){
          return true;
        }
      })
    }catch(e){
      console.log(e)
    }

    return false;
}

const getDistanceInMeter = async (me, person)=>{
    return Distance.between(me, person).human_readable();
}

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
        
        await axios({
          method: "POST",
          url: "https://api.ng.termii.com/api/sms/send",
          data: {
            "to": phone,
            "from": "N-Alert",
            "type": "plain",
            "sms": body,
            "channel": "dnd",
            "api_key": process.env.TERMII_API_KEY,
          }
        })
        // resolve(otp);
      } catch (error) {
        console.log(error);
        // reject(error);
    }
}

const sendPushNoti = async(title, body, token, noti_payload = null, data = null, shouldLive = false)=>{
  // token would be ['__token_string1', '__token_string2']
  let payload = {
    notification: {
      title,
      body,
      ...noti_payload
    },
    data
  }

  let options = {
    priority: "high",
    timeToLive: shouldLive ? (365 * (60 * 60 *24)) :60 * 60 *24
  }

  const res = (await firebase.messaging().sendToDevice(token, payload, options))
  
  console.log(res)
  
  return ((res.successCount > 0)) ? true:false
}

const notifyPartiesOfMerged = async(id1, id2)=>{
  // get token && data of id1
  // get token && data of id2

  // send notification
  // send email

  const data1 = (await db.promise().query("SELECT * users AS A inner JOIN push_noti AS B ON A.u_id=B.account_id WHERE A.u_id = ?", [id1]))[0][0];
  const data2 = (await db.promise().query("SELECT * users AS A inner JOIN push_noti AS B ON A.u_id=B.account_id WHERE A.u_id = ?", [id2]))[0][0];

  const token1 = data1.device_token;
  const token2 = data2.device_token;

  const title = "You Have Successfully Merged with a new interest";

  const message = "Open App to see the new activities and chats";

  return (await sendPushNoti(title, message, [token1, token2]))
  
}

const notifyPartiesOfMessage = async(id1, from, message)=>{
  // get token && data of id1
  // get token && data of id2

  // send notification
  // send email

  const data1 = (await db.promise().query("SELECT * users AS A inner JOIN push_noti AS B ON A.u_id=B.account_id WHERE A.u_id = ?", [id1]))[0][0];

  const token1 = data1.device_token;

  const title = "You Have a New Message From "+from;

  return (await sendPushNoti(title, message, [token1]))
  
}

module.exports = {
    sendMail,
    sendSMS,
    sendPushNoti,
    getOnlineStatus,
    getDistanceInMeter,
    initPusher,
    filterByInterest,
    notifyPartiesOfMerged,
    notifyPartiesOfMessage,
    pusher_presence_channel_name,
    pusherObject: pusher
}