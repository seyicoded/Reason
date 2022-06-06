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
    const user_id = (await req.user).u_id;

    // check if main profile already exist
    db.execute("SELECT * FROM users_images WHERE u_id = ?", [user_id], (err, results)=>{
        if(err){
            return res.status(500).json({
                status: false,
                message: 'an error occurred',
                error: err
            })
        }

        if(results.length > 0){
            if(results[0].main_media){
                return res.status(500).json({
                    status: false,
                    message: 'Main media already exist',
                    error: 'error'
                })
            }

            form.parse(req, async (err2, fields, files)=>{
                if(err2){
                    return res.status(500).json({
                        status: false,
                        message: 'an error occurred',
                        error: err
                    })
                }
    
                const media = (files.media);
                let originalFilename = media.originalFilename;
                let originalFilenameArr = originalFilename.split('.')
                let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
                originalFilename = `${uuidv4()}.${fileExtension}`;
        
                const url = await uploadFile(`${media.filepath}`, originalFilename)
    
                db.execute("UPDATE users_images SET image = ? WHERE u_id = ?", [url, user_id], (err, results)=>{
                    if(err){
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
                            results: results
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
        }else{
            form.parse(req, async (err, fields, files) => {
                const media = (files.media);
                let originalFilename = media.originalFilename;
                let originalFilenameArr = originalFilename.split('.')
                let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
                originalFilename = `${uuidv4()}.${fileExtension}`;
        
                const url = await uploadFile(`${media.filepath}`, originalFilename)
        
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

        
    })

    
}

const uploadOtherMediaController = async(req, res)=>{

}

module.exports = {
    uploadMainMediaController,
    uploadOtherMediaController
}