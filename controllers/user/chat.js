const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { notifyPartiesOfMessage, getOnlineStatus, getDistanceInMeter, filterByInterest, notifyPartiesOfMerged } = require('../../resource/general');

const { initPusher } = require('../../resource/general');

const pusherObject = initPusher()
const storageRef = firebase.storage().bucket('gs://reasnsapp.appspot.com');

const uploadFile = async(path, filename, others) => {
    // Upload the File
    let dest;
    if(others){
        dest = `/uploads/other_media/${filename}`;
    }else{
        dest = `/uploads/main_media/${filename}`;
    }

    const storage = await storageRef.upload(path, {
        public: true,
        destination: dest,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        }
    });


    return storage[0].metadata.mediaLink;
}

const getMyChat = async (req, res)=>{
    // get all list of active lik_linker
    // loop through it and get the id of the other party and get the user info
    // loop through chat and get the chats
    try{
        const user_id = (await req.user).u_id;
        const chatData = []
        const myData = (await db.promise().query("SELECT * FROM like_linker WHERE sender_id LIKE '%?%' && reciever_id LIKE '%?%' && status = 1", [user_id, user_id]))[0];

        for (let index = 0; index < myData.length; index++) {
            const element = myData[index];
            const other_id = element.sender_id == user_id ? element.reciever_id : element.sender_id;
            const other_data = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [other_id]))[0][0];
            // const other_media = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [other_id]))[0];
            const chat = (await db.promise().query("SELECT * FROM chat_message WHERE ll_id = ? AND status = 1", [element.ll_id]))[0];
            chatData[index] = {
                ll_id: element.ll_id,
                other_data,
                // other_media,
                chat
            }
        }

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: chatData,
        })

    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const getSingleChat = async (req, res)=>{
    try{
        const user_id = (await req.user).u_id;
        const {ll_id} = req.params

        const chat = (await db.promise().query("SELECT * FROM chat_message WHERE ll_id = ? AND status = 1", [element.ll_id]))[0];

        // update last seen

        try{
            await db.promise().query("UPDATE chat_message SET seen = 'true' WHERE ll_id = ? AND sender_id != ?", [ll_id, user_id]);
        }catch(e){}

        return res.status(200).json({
            status: true,
            message: 'successfully fetched',
            data: chat,
        })

    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const sendChat = async (req,res)=>{
    // get reciever id to send push notification
    // enter chat into record
    // send push notification to reciever
    // send pusher event to chat

    try{
        const form = formidable({ multiples: true });
        const user_id = (await req.user).u_id;
        var content = '';
        if(true){
            // treat as media chat
            form.parse(req, async (err, fields, files) => {
                if(err){
                    return res.status(500).json({
                        status: false,
                        message: 'an error occurred',
                        error: err
                    })
                }

                const {ll_id, type} = fields

                if(type != 'plain_text'){
                    const media = (files.content);
                    let originalFilename = media.originalFilename;
                    let originalFilenameArr = originalFilename.split('.')
                    let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
                    originalFilename = `${uuidv4()}.${fileExtension}`;
            
                    content = await uploadFile(`${media.filepath}`, originalFilename)
                }else{
                    content = fields.content
                }
        

            // insert entry into database
            const insert_query = `INSERT INTO chat_message (ll_id, sender_id, content, type, status) VALUES (?,?,?,?,1)`;
            const insert_data = [ll_id, user_id, content, type];
            const insert_result = await db.promise().query(insert_query, insert_data);
            const insert_id = insert_result[0].insertId;

            // send push notification to reciever
            const ll_data = (await db.promise().query("SELECT * FROM like_linker WHERE ll_id = ?", [ll_id]))[0][0];
            const other_id = ll_data.sender_id == user_id ? ll_data.reciever_id : ll_data.sender_id;
            const other_data = (await db.promise().query("SELECT * FROM users AS user_data WHERE user_data.u_id = ?", [other_id]))[0][0];
            try{
                await notifyPartiesOfMessage(other_id, other_data.f_name + ' '+ other_data.l_name, (type == 'plain_text' ? content : type ))
            }catch(e){console.log(e)}

            // send pusher event
            pusherObject.trigger('private-channel-chat', 'new_message_'+ll_id, {
                ll_id,
                sender_id: user_id,
                content,
                type,
                time: new Date().getTime()
            })

            return res.status(200).json({
                status: true,
                message: 'successfully sent',
                data: {
                    ll_id,
                    sender_id: user_id,
                    content,
                    type,
                    time: new Date().getTime()
                }
            })

        })
    }

    }catch(e){
        console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    getMyChat,
    getSingleChat,
    sendChat
}