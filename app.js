const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const imageUploader = require('./config/imageUploader');

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

//데이터베이스 설정
const db_config = require('./config/config');
const conn = db_config.init();

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
    console.log('/img api start');
    try{
        console.log("req.file", req.file);
    } catch(err) {
        console.error(err);
    }
    //console.log(req.file.filename);
    res.json({
        //"url": req.file.location, //이미지 파일 경로
        "code": "success"
    });
});

app.get('/', (req,res) => {
    res.send('54.180.74.18');
})

//일반 회원 회원가입
app.post('/signUp_general', async function(req,res){
    console.log('/signUp_general');
    let mID = req.body.mID;
    let mPW = req.body.mPW;
    let mName = req.body.mName;
    let mEmail = req.body.mEmail;
    let mDept = req.body.mDept;
    let mChat = req.body.mChat;
    let mEdu = req.body.mEdu;
    let mGender = req.body.mGender;
    let mPosition = req.body.mPosition;

    var params = [mID, mPW, mName, mEmail, mDept, mChat, mEdu, mGender, mPosition];

    var sql = 'INSERT INTO init_new.member (mID, mPW, mName, mEmail, mDept, mChat, mEdu, mGender, mPosition) VALUES(?,?,?,?,?,?,?,?,?)';

    var resultCode, message;

    conn.query(sql, params, function(err,result) {
        if(err) {
            console.error(err);
            resultCode = 500;
            message = "회원가입에 실패하였습니다. 다시 시도해주세요";
        } else {
            resultCode = 200,
            message = "회원가입이 완료되었습니다";
        }
        res.json({
            'code': resultCode,
            'message': message
        });
    });
});