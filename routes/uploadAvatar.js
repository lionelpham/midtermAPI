var passport = require('passport')
var express = require('express')
var {uploadImage} = require('../multer/multer')
const fs = require('fs');
var router = express.Router();
const {ROLE_DRIVE_PERMISSION,TYPE_DRIVE_PERMISSION,google_api_client} = require('../google-api')


router.post('/',passport.authenticate('jwt',{session:false}),
                uploadImage,
                (req,res)=>{
                    // get file
                    console.log('test',req.file)
                    // get current user
                    console.log('demo',req.user.getDataValue('username'))

                    const username = req.user.getDataValue('username');
                    const avatarImageID = req.user.getDataValue('imgAvatarID');

                    const ggClient = new google_api_client({
                        credentialsPath: __dirname + '/../credentials.json',
                        tokenPath: __dirname + '/../token.json',
                        scopes: [
                            'https://www.googleapis.com/auth/drive',
                            'https://www.googleapis.com/auth/drive.file',
                            'https://www.googleapis.com/auth/drive.appfolder'
                        ]
                    })

                    const fileUrl = req.file.path;
                    if(avatarImageID){
                        ggClient.deleteFile(avatarImageID).catch(err=>console.log('err delefile',err))

                    }
                    ggClient
                        .uploadFile({
                        filename: req.file.filename,
                        mimeType: req.file.mimetype,
                        fileUrl,
                        folderId: null,
                        toFolder: 'Midterm',
                        permissions: [
                            {
                            role: ROLE_DRIVE_PERMISSION.READER,
                            type: TYPE_DRIVE_PERMISSION.ANYONE
                            }
                        ]
                        })

                    
                    .then(ret=>{
                        fs.unlink(fileUrl,()=>{ })
                        req.user.update({
                            imgAvatar: ret.downloadUrl,
                            imgAvatarID: ret.fileId
                        })
                        .then(user => res.status(200).send({
                            message: 'upload img success',
                            user
                        }))
                        .catch(err=>console.log(err))
                    })
                    .catch(err=>console.log(err))
})
module.exports = router