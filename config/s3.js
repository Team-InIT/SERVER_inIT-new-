const AWS = require('aws-sdk');

//aws 연결 설정
const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
});

module.exports = s3;