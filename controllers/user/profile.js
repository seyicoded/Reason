const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');

const storageRef = firebase.storage().bucket('gs://reasnsapp.appspot.com');

const uploadFile = async(path, filename) => {
    // Upload the File
    const storage = await storageRef.upload(path, {
        public: true,
        destination: `/uploads/main_media/${filename}`,
        metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
        }
    });


    return storage[0].metadata.mediaLink;
}

const uploadMainMediaController = async (req, res)=>{
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
        const media = (files.media);
        let originalFilename = media.originalFilename;
        let originalFilenameArr = originalFilename.split('.')
        let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
        originalFilename = `${uuidv4()}.${fileExtension}`;

        const user_id = (await req.user).u_id;

        const url = await uploadFile(`${media.filepath}`, originalFilename)

        // console.log(user_id)
        // console.log(url)
        // return

        db.execute("INSERT INTO users_images(id, u_id, image, status) VALUES(?, ?, ?, ?)",[uuidv4(), user_id, url, 1],(err1, results, fields)=>{
            if(err1){
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: err
                })
            }

            if(results.affectedRows > 0){
                return res.status(201).json({
                    status: true,
                    message: 'Main media successfully uploaded',
                    results: results,
                    url: url
                })
            }else{
                return res.status(500).json({
                    status: false,
                    message: 'an error occurred',
                    error: 'error'
                })
            }
        })
    })
}

module.exports = {
    uploadMainMediaController
}