const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { notifyPartiesOfMessage, getOnlineStatus, getDistanceInMeter, filterByInterest, notifyPartiesOfMerged, PER_BROADCAST_COST, PAYSTACK_SECRET_KEY, sendPushNoti, } = require('../../resource/general');

const { initPusher } = require('../../resource/general');
const { default: axios } = require('axios');

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

const createBroadcast = async (req, res)=>{
    try{
        const form = formidable({ multiples: true });
        const user_id = (await req.user).u_id;

        // check if hasImage is sent
        var content = '';
        if(true){
            // upload image and get the url
            form.parse(req, async (err, fields, files) => {
                const {
                    title,
                    description,
                    hasImage,
                    isSorted,
                    gender,
                    region,
                    total_number_to_reach,
                    expire_on
                } = fields

                console.log(fields)

                if(err){
                    return res.status(500).json({
                        status: false,
                        message: 'an error occurred',
                        error: err
                    })
                }
                
                if(hasImage == 'true'){
                    const media = (files.image);
                    let originalFilename = media.originalFilename;
                    let originalFilenameArr = originalFilename.split('.')
                    let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
                    originalFilename = `${uuidv4()}.${fileExtension}`;
            
                    content = await uploadFile(`${media.filepath}`, originalFilename)
                }
                

                // get user currency
                const userData = (await db.promise().query("SELECT * FROM users WHERE u_id = ?", [user_id]))[0][0];
                const currency = userData.currency;

                // get conversion rate to user currency
                const conversionRate = (await db.promise().query("SELECT * FROM app_currency WHERE currency = ?", [currency]))[0][0];
                const conversionRateToUserCurrency = parseFloat(conversionRate.one_usd_equal);

                // get amount in usd of broadcast per user
                const amountPerBroadcastInLocalCurrency = parseFloat(PER_BROADCAST_COST) * conversionRateToUserCurrency;
                
                const amountToPay = parseFloat(amountPerBroadcastInLocalCurrency * parseFloat(total_number_to_reach));

                // send request to paystack
                var paystackResponse;
                try{
                    paystackResponse = await axios({
                        method: 'POST',
                        url: 'https://api.paystack.co/transaction/initialize',
                        data: {
                            amount: amountToPay * 100,
                            email: userData.email,
                            currency: currency,
                            callback_url: 'https://example.com/success',
                            },
                        headers: {
                            "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`
                        }
                    })
                }catch(e){
                    console.log(e)
                    return res.status(200).json({
                        status: false,
                        message: 'An error occurred',
                        data: e,
                    })
                }

                const ref = paystackResponse.data.data.reference;
                const paymentUrl = paystackResponse.data.data.authorization_url;

                // create broadcast
                const broadcast_id = (await db.promise().query("INSERT INTO broadcast_holder (u_id, tnx_ref, title, description, content, is_Sorted, distance_range, gender, to_total_user, expire_on, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [user_id, ref, title, description, content, isSorted, region, gender, total_number_to_reach, expire_on, 0]))[0].insertId;

                return res.status(201).json({
                    status: true,
                    message: 'Broadcast Entry Created, Processing to payment',
                    data: {
                        payment_url: paymentUrl,
                        broadcast_id: broadcast_id
                    }
                })

            })
    }
        
    }catch(e){
        // console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const verifyBroadcast = async(req, res)=>{
    try{
        const { broadcast_id } = req.body;
        const user_id = (await req.user).u_id;

        // get broadcast data
        const broadcastData = (await db.promise().query("SELECT * FROM broadcast_holder WHERE bh_id = ?", [broadcast_id]))[0][0];
        const ref = broadcastData.tnx_ref;

        // check if broadcast is already verified
        if(broadcastData.status != 0){
            return res.status(200).json({
                status: false,
                message: 'Broadcast is already verified',
            })
        }

        // send request to paystack to verify request
        const paystackResponse = await axios({
            method: 'GET',
            url: 'https://api.paystack.co/transaction/verify/'+ref,
            headers: {
                "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        })

        if(paystackResponse.data.data.status !== 'success'){
            // payment was not successful
            return res.status(200).json({
                status: false,
                message: 'Payment was not successful',
                data: paystackResponse.data
            })
        }

        // verify broadcast
        const update = await db.promise().query("UPDATE broadcast_holder SET status = 1 WHERE bh_id = ?", [broadcast_id]);

        try{
            setTimeout(()=>{
                triggerBroadcast(broadcast_id)
            }, 10000);
        }catch(e){}

        return res.status(200).json({
            status: true,
            message: 'Broadcast verified and have been added to queue',
        })
    }catch(e){
        // console.log(e)
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

const sendBroadcast = async(data, idToSend)=>{
    // console.log(idToSend)
    if(idToSend.length == 0){
        return
    }


    try{
        await sendPushNoti(data.title, data.description, idToSend, {}, null, true, {
            android: {
                notification: {
                  imageUrl: data.content
                }
            },
            apns: {
                payload: {
                aps: {
                    'mutable-content': 1
                }
                },
                fcm_options: {
                image: data.content
                }
            },
            webpush: {
                headers: {
                image: data.content
                }
            }
        })
    }catch(e){
        console.log(e)
    }
}

// universal code to trigger broadcast
const triggerBroadcast = async(bh_id = null)=>{
    // get broadcast depending on if bh_id was sent
    var broadcastData;
    if(bh_id == null){
        broadcastData = (await db.promise().query("SELECT * FROM broadcast_holder WHERE (status = 1 || status = 2)", []))[0];
    }else{
        broadcastData = (await db.promise().query("SELECT * FROM broadcast_holder WHERE (status = 1 || status = 2) AND bh_id = ?", [bh_id]))[0];
    }

    // universal code for all, nothing special
    for (const element of broadcastData) {
        const data = element;

        // before any code, check if it's expire, if it is, then just finish it before anything
        if((new Date(data.expire_on)).getTime() < new Date().getTime()){
            // it's already expired
            await db.promise().query("UPDATE broadcast_holder SET status = 3 WHERE bh_id = ?", [data.bh_id]);
            continue;
        }

        var idToSend = []
        
        var max = parseInt(data.to_total_user);
        var done = parseInt(data.total_user_done);

        var remaining = max - done;
        var owner_id = data.u_id;

        if(remaining <= 0){
            // exhausted send to user allowed
            await db.promise().query("UPDATE broadcast_holder SET status = 3 WHERE bh_id = ?", [bh_id]);
            continue;
        }

        // get owner data
        const ownerData = (await db.promise().query("SELECT * FROM users WHERE u_id = ?", [owner_id]))[0][0];

        // get all users except owner
        const users = (await db.promise().query(`SELECT * FROM users WHERE u_id != ? LIMIT ${remaining}`, [owner_id]))[0];
        var total_done = 0;
        for(const user_data of users ){
            const user = user_data;
            const user_gender = user.gender;
            const user_lat = user.lat;
            const user_lng = user.lng;

            // check if filter is enabled
            if(data.is_Sorted == 'true'){
                // is sorted
                
                // sort gender first
                if( (data.gender == 'all') || (data.gender == user_gender) ){
                    // check if distance is within range
                    const distanceInMeter = (getDistanceInMeter({
                        lat: ownerData.lat,
                        lon: ownerData.lng
                    }, {
                        lat: user_lat,
                        lon: user_lng
                    })) * 1000;

                    if( (data.distance_range == 'all') || (parseInt(distanceInMeter) <= parseInt(data.distance_range))){
                        // add this user to the list
                        total_done++;
                        
                        // get user token
                        const userToken = (await db.promise().query("SELECT * FROM push_noti WHERE account_id = ?", [user.u_id]))[0][0];
                        idToSend.push(userToken.device_token+'');
                    }else{
                        // distance is not within range
                        // skip this user
                    }
                }else{
                    // skip, as it's not in category
                }
            }else{
                // just send request to user and add count
                total_done++;

                // get user token
                const userToken = (await db.promise().query("SELECT * FROM push_noti WHERE account_id = ?", [user.u_id]))[0][0];
                idToSend.push(userToken.device_token+'');
            }
        }

        // check if it actually fulfill other
        const isFulfilled = remaining - total_done
        var status;
        if(isFulfilled > 0){
            // not fulfilled
            status = 2;
        }else{
            // is fulfilled
            status = 3;
        }

        // update broadcast
        await db.promise().query("UPDATE broadcast_holder SET total_user_done = ?, status = ? WHERE bh_id = ?", [total_done, status, data.bh_id]);

        // send the broadcast
        await sendBroadcast(data, idToSend);
    }
    
}

module.exports = {
    createBroadcast,
    verifyBroadcast,
    triggerBroadcast
}