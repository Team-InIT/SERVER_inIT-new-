const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const s3 = require('./s3');

//multer 설정
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp']

const imageUploader = multer({
    storage: multerS3({
        s3: s3,
        bucket: "init-project-bucket",//생성한 버킷 이름
        acl: "public-read-write",
        key: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            if(!allowedExtensions.includes(extension)) {//확장자가 이미지가 아닌 경우
                return cb(new Error('wrong extensions'));
            }
            cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
        },
    }),
});

module.exports = imageUploader;