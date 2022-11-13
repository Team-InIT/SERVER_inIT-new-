const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
const multerS3 = require('multer-s3');

//aws 연결 설정
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
});

const s3 = new AWS.S3();

//multer 설정
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp']

const imageUploader = multer({
    storage: multerS3({
        s3: s3,
        bucket: "init-project-bucket",//생성한 버킷 이름
        key: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            if(!allowedExtensions.includes(extension)) {//확장자가 이미지가 아닌 경우
                return cb(new Error('wrong extensions'));
            }
            cb(null, `post/${Date.now()}_${path.basename(file.originalname)}`);
        },
        //acl: 'public-read-write'
    }),
})

module.exports = imageUploader;