const formidable = require('formidable');
const firebase = require('../../resource/firebase')
const {getDB} = require('../../db/index')
const db = getDB;
const { v4: uuidv4 } = require('uuid');

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
                            message: 'Main media successfully updated',
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
    const form = formidable({ multiples: true });
    const user_id = (await req.user).u_id;

    
    form.parse(req, async (err, fields, files) => {
        const media = (files.media);
        let originalFilename = media.originalFilename;
        let originalFilenameArr = originalFilename.split('.')
        let fileExtension = originalFilenameArr[originalFilenameArr.length - 1]
        originalFilename = `${uuidv4()}.${fileExtension}`;

        const url = await uploadFile(`${media.filepath}`, originalFilename, true)

        db.execute("INSERT INTO user_medias(id, u_id, media, status, extension) VALUES(?, ?, ?, ?, ?)",[uuidv4(), user_id, url, 1, fileExtension],(err1, results, fields)=>{
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
                    message: 'Main media successfully uploaded/Added',
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

const deleteOtherMediaController = async(req, res)=>{
    const user_id = (await req.user).u_id;

    const media_id = (req.query.media_id)

    // delete media from db and return output
    db.execute("DELETE FROM user_medias WHERE id = ?", [media_id], (err, results)=>{
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
                message: 'Media successfully deleted',
                results: results
            })
        }
    })
}

const updateLocationController = async(req, res)=>{
    const user_id = (await req.user).u_id;

    // update user location
    const data = (await db.promise().query("UPDATE users SET lat = ?, lng = ? WHERE u_id = ?", [req.body.lat, req.body.lng, user_id]))[0];

    if(data.affectedRows > 0){
        return res.status(200).json({
            status: true,
            message: 'successfully changed',
            data: null
        })
    }else{
        return res.status(200).json({
            status: true,
            message: 'same as previous location',
            data: null
        })
    }
    
}

const getController = async(req, res)=>{
    const user_id = (await req.user).u_id;

    const data = (await db.promise().query("SELECT * FROM users AS user_data INNER JOIN users_images AS user_image ON user_data.u_id = user_image.u_id WHERE user_data.u_id = ?", [user_id]))[0][0];
    const other_media = (await db.promise().query("SELECT * FROM user_medias WHERE u_id = ?", [user_id]))[0];

    delete data.main_image;

    return res.status(200).json({
        status: true,
        message: 'successfully fetched',
        data: data,
        all_medias: other_media
    })
}

module.exports = {
    uploadMainMediaController,
    uploadOtherMediaController,
    deleteOtherMediaController,
    updateLocationController,
    getController
}