const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const imageUploader = require('./imageUploader');

dotenv.config();
const app = express();

//포트 번호 3006으로 기본값 설정
app.set('port', process.env.PORT || 3006);

//미들웨어 설정
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    name: 'session-cookie',
}));


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 대기 중');
});

//서버 동작 테스트
app.post('/test', async function (req,res) {
    console.log('test api')
    res.json({
        'message': "테스트 완료, 서버 동작 확인"
    });
});

//s3 연동 테스트
app.post('/img', imageUploader.single("img"), (req,res,next) => {
    console.log(req.file);
    console.log(process.env.S3_ACCESS_KEY_ID);
    console.log(process.env.S3_SECRET_ACCESS_KEY);
    res.json({
        "url": req.file.location, //이미지 파일 경로
    });
});