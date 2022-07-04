const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');
const { notifyPartiesOfMessage, getOnlineStatus, getDistanceInMeter, filterByInterest, notifyPartiesOfMerged, PER_BROADCAST_COST, PAYSTACK_SECRET_KEY } = require('../../resource/general');

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
        const broadcastData = (await db.promise().query("SELECT * FROM broadcast_holder WHERE broadcast_id = ?", [broadcast_id]))[0][0];
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
        const update = await db.promise().query("UPDATE broadcast_holder SET status = 1 WHERE broadcast_id = ?", [broadcast_id]);

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

module.exports = {
    createBroadcast,
    verifyBroadcast
}