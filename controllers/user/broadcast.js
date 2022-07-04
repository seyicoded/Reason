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
        const user_id = (await req.user).u_id;
        const {
            title,
            description,
            hasImage,
            isSorted,
            gender,
            region,
            total_number_to_reach,
            expire_on
        } = req.body

        // check if hasImage is sent
        var content = '';
        if(hasImage == 'true'){
            // upload image and get the url

            const form = formidable({ multiples: true });
            form.parse(req, async (err, fields, files) => {
                if(err){
                    return res.status(500).json({
                        status: false,
                        message: 'an error occurred',
                        error: err
                    })
                }
            })

            const media = (files.media);
            let originalFilename = media.originalFilename;
            let originalFilenameArr = originalFilename.split('.')
            let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
            originalFilename = `${uuidv4()}.${fileExtension}`;
    
            content = await uploadFile(`${media.filepath}`, originalFilename)
        }

        // get user currency
        const userData = (await db.promise().query("SELECT * FROM users WHERE u_id = 1", [user_id]))[0][0];
        const currency = userData.currency;

        // get conversion rate to user currency
        const conversionRate = (await db.promise().query("SELECT * FROM app_currency WHERE currency = ?", [currency]))[0][0];
        const conversionRateToUserCurrency = parseFloat(conversionRate.one_usd_equal);

        // get amount in usd of broadcast per user
        const amountPerBroadcastInLocalCurrency = parseFloat(PER_BROADCAST_COST) * conversionRateToUserCurrency;

        const amountToPay = (amountPerBroadcastInLocalCurrency * total_number_to_reach).toFixed(2);

        // send request to paystack
        const paystackResponse = await axios.post("https://api.paystack.co/transaction/initialize", {
            amount: amountToPay * 100,
            email: userData.email,
            currency: currency,
        }, {
            headers: {
                "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`
            }
        })

        const ref = paystackResponse.data.data.reference;
        const paymentUrl = paystackResponse.data.data.authorization_url;

        // create broadcast
        const broadcast_id = (await db.promise().query("INSERT INTO broadcast_holder (u_id, tnx_ref, title, description, content, is_Sorted, distance_range, gender, to_total_user, expire_on, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [user_id, ref, title, description, content, isSorted, region, gender, total_number_to_reach, expire_on, 0]))[0][0].insertId;

        return res.status(201).json({
            status: true,
            message: 'Broadcast Entry Created, Processing to payment',
            data: {
                payment_url: paymentUrl,
                broadcast_id: broadcast_id
            }
        })
        
    }catch(e){
        return res.status(200).json({
            status: false,
            message: 'An error occurred',
            data: e,
        })
    }
}

module.exports = {
    createBroadcast
}