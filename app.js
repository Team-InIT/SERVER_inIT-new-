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
        "resultCode": "success"
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
    let mInterest = req.body.mInterest;
    mInterest = mInterest.join();
    console.log(mInterest);

    var params = [mID, mPW, mName, mEmail, mDept, mChat, mEdu, mGender, mPosition, mInterest];

    var sql = 'INSERT INTO init_new.member (mID, mPW, mName, mEmail, mDept, mChat, mEdu, mGender, mPosition, mInterest) VALUES(?,?,?,?,?,?,?,?,?,?)';

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
            'resultCode': resultCode,
            'message': message
        });
    });
});

//기업회원 회원가입
app.post('/signUp_company', async function(req,res) {
    console.log('/signUp_company');
    let cID = req.body.cID;
    let cPW = req.body.cPW;
    let cManagerName = req.body.cManagerName;
    let cManagerEmail = req.body.cManagerEmail;
    let cManagerCall = req.body.cManagerCall;
    let cType = req.body.cType;
    let cRegistNum = req.body.cRegistNum;
    let cName = req.body.cName;
    let cBoss = req.body.cBoss;
    let cAddress = req.body.cAddress;

    var params = [cID, cPW, cManagerName, cManagerEmail, cManagerCall, cType, cRegistNum, cName, cBoss, cAddress];

    var sql = "INSERT INTO init_new.company (cID, cPW, cManagerName, cManagerEmail, cManagerCall, cType, cRegistNum, cName, cBoss, cAddress) VALUES(?,?,?,?,?,?,?,?,?,?)";

    var resultCode, message;

    conn.query(sql, params, function(err, result) {
        if(err) {
            console.error(err);
            resultCode = 500;
            message = "회원가입에 실패하였습니다. 다시 시도해주세요";
        } else{
            resultCode = 200,
            message = "회원가입이 완료되었습니다";
        }
        res.json({
            'resultCode': resultCode,
            'message': message
        });
    });
});

//아이디 중복확인
app.post('/isDuplicate', async function(req,res){
    console.log('/isDuplicate');
    let isCompany = req.body.isCompany;
    let id = req.body.id;

    var sql = "";

    var resultCode, isDuplicate, message;

    if(isCompany) { //기업회원
        sql = "SELECT * from init_new.company WHERE cID = ?";
        conn.query(sql, [id], function(err, result){
            if(err) {
                console.error(err);
                resultCode = 500;
                isDuplicate = null;
                message = "오류가 발생했습니다. 다시 시도해주세요";
            } else {
                if(result.length !== 0) {//중복
                    resultCode = 200;
                    isDuplicate = true;
                    message = "이미 사용 중인 아이디입니다";
                } else {
                    resultCode = 200,
                    isDuplicate = false,
                    message = "사용 가능한 아이디입니다";
                }
            }
            res.json({
                "resultCode": resultCode,
                "isDuplicate": isDuplicate,
                "message": message
            });
        })
    } else {//일반회원
        sql = "SELECT * from init_new.member WHERE mID = ?";
        conn.query(sql, [id], function(err, result){
            console.log(result[0]);
            if(err) {
                console.error(err);
                resultCode = 500;
                isDuplicate = null;
                message = "오류가 발생했습니다. 다시 시도해주세요";
            } else {
                if(result.length !== 0) {//중복
                    resultCode = 200;
                    isDuplicate = true;
                    message = "이미 사용 중인 아이디입니다";
                } else {
                    resultCode = 200,
                    isDuplicate = false,
                    message = "사용 가능한 아이디입니다";
                }
            }
            res.json({
                "resultCode": resultCode,
                "isDuplicate": isDuplicate,
                "message": message
            });
        });
    }
});

//로그인
app.post('/login', async function(req,res) {
    console.log('/login');

    let isCompany = req.body.isCompany;
    let id = req.body.id;
    let pw = req.body.pw;

    var sql = "";

    var params = [id, pw];

    var resultCode, num, name, message;

    if(isCompany) {//기업 회원
        sql = "SELECT * from init_new.company WHERE cID = ? and cPW = ?";
        conn.query(sql, params, function(err,result) {
            if(err) {
                resultCode = 500;
                num = null;
                name = null;
                message = "로그인에 실패했습니다. 다시 시도해주세요";
            } else {
                if(result.length === 0) {
                    resultCode = 200;
                    num = null;
                    name = null;
                    message = "아이디 또는 비밀번호를 확인해주세요";
                } else {
                    resultCode = 200;
                    num = result[0].cNum;
                    name = result[0].cName;
                    message =`${name}님 환영합니다`;
                }
            }
            res.json({
                "resultCode": resultCode,
                "cNum": num,
                "cName": name,
                "message": message
            });
        });
    } else {//일반 회원
        sql = "SELECT * from init_new.member WHERE mID = ? and mPW = ?";
        conn.query(sql, params, function(err,result) {
            if(err) {
                resultCode = 500;
                num = null;
                name = null;
                message = "로그인에 실패했습니다. 다시 시도해주세요";
            } else {
                if(result.length === 0) {
                    resultCode = 200;
                    num = null;
                    name = null;
                    message = "아이디 또는 비밀번호를 확인해주세요";
                } else {
                    resultCode = 200;
                    num = result[0].mNum;
                    name = result[0].mName;
                    message =`${name}님 환영합니다`;
                }
            }
            res.json({
                "resultCode": resultCode,
                "mNum": num,
                "mName": name,
                "message": message
            });
        });
    }
});