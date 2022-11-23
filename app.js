const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const imageUploader = require('./config/imageUploader');
const CheckWriter = require('./config/checkWriter');

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
const checkWriter = require('./config/checkWriter');
const conn = db_config.init();

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 서버 대기 중');
});

//서버 동작 테스트
app.post('/test', async function (req, res) {
    console.log('test api')
    res.json({
        'message': "테스트 완료, 서버 동작 확인"
    });
});

//s3 연동 테스트
app.post('/img', imageUploader.single("img"), (req, res, next) => {
    console.log('/img api start');
    try {
        console.log("req.file", req.file);
    } catch (err) {
        console.error(err);
    }
    //console.log(req.file.filename);
    res.json({
        //"url": req.file.location, //이미지 파일 경로
        "resultCode": "success"
    });
});

app.get('/', (req, res) => {
    res.send('54.180.74.18');
})

//일반 회원 회원가입
app.post('/signUp_general', async function (req, res) {
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

    conn.query(sql, params, function (err, result) {
        if (err) {
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
app.post('/signUp_company', async function (req, res) {
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

    conn.query(sql, params, function (err, result) {
        if (err) {
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

//아이디 중복확인
app.post('/isDuplicate', async function (req, res) {
    console.log('/isDuplicate');
    let isCompany = req.body.isCompany;
    let id = req.body.id;

    var sql = "";

    var resultCode, isDuplicate, message;

    if (isCompany) { //기업회원
        sql = "SELECT * from init_new.company WHERE cID = ?";
        conn.query(sql, [id], function (err, result) {
            if (err) {
                console.error(err);
                resultCode = 500;
                isDuplicate = null;
                message = "오류가 발생했습니다. 다시 시도해주세요";
            } else {
                if (result.length !== 0) {//중복
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
        conn.query(sql, [id], function (err, result) {
            console.log(result[0]);
            if (err) {
                console.error(err);
                resultCode = 500;
                isDuplicate = null;
                message = "오류가 발생했습니다. 다시 시도해주세요";
            } else {
                if (result.length !== 0) {//중복
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
app.post('/login', async function (req, res) {
    console.log('/login');

    let isCompany = req.body.isCompany;
    let id = req.body.id;
    let pw = req.body.pw;

    var sql = "";

    var params = [id, pw];

    var resultCode, num, name, message;

    if (isCompany) {//기업 회원
        sql = "SELECT * from init_new.company WHERE cID = ? and cPW = ?";
        conn.query(sql, params, function (err, result) {
            if (err) {
                resultCode = 500;
                num = null;
                name = null;
                message = "로그인에 실패했습니다. 다시 시도해주세요";
            } else {
                if (result.length === 0) {
                    resultCode = 200;
                    num = null;
                    name = null;
                    message = "아이디 또는 비밀번호를 확인해주세요";
                } else {
                    resultCode = 200;
                    num = result[0].cNum;
                    name = result[0].cName;
                    message = `${name}님 환영합니다`;
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
        conn.query(sql, params, function (err, result) {
            if (err) {
                resultCode = 500;
                num = null;
                name = null;
                message = "로그인에 실패했습니다. 다시 시도해주세요";
            } else {
                if (result.length === 0) {
                    resultCode = 200;
                    num = null;
                    name = null;
                    message = "아이디 또는 비밀번호를 확인해주세요";
                } else {
                    resultCode = 200;
                    num = result[0].mNum;
                    name = result[0].mName;
                    message = `${name}님 환영합니다`;
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

//프로젝트 등록
app.post('/projectUpload', async function (req, res) {
    console.log('/projectUpload');

    let isCompany = req.body.isCompany;
    let pTitle = req.body.pTitle;
    let pType = req.body.pType;
    let pField = req.body.pField;
    let pScale = req.body.pScale;
    let pRecruitDue = req.body.pRecruitDue;
    let pStart = req.body.pStart;
    let pDue = req.body.pDue;
    let pOn = req.body.pOn;
    let pState = req.body.pState;
    let pWorkingTime = req.body.pWorkingTime;
    let pPlan = req.body.pPlan;
    let pDesign = req.body.pDesign;
    let pDevelop = req.body.pDevelop;
    let pStack = req.body.pStack;
    let pDescription = req.body.pDescription;

    pStack = pStack.join();

    var resultCode, message;

    if (isCompany) {//기업회원
        let cNum = req.body.cNum;
        var params = [pTitle, pType, pField, pScale, pRecruitDue, pStart, pDue, pOn, pState, pWorkingTime, pPlan, pDesign, pDevelop, pStack, pDescription, cNum];

        var sql = "INSERT INTO init_new.project (pTitle, pType, pField, pScale, pRecruitDue, pStart, pDue, pOn, pState, pWorkingTime, pPlan, pDesign, pDevelop, pStack, pDescription, cNum)";
        sql += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        conn.query(sql, params, function (err, result) {
            if (err) {
                console.error(err);
                resultCode = 500;
                message = "등록에 실패했습니다. 다시 시도해주세요";
            } else {
                resultCode = 200;
                message = "등록이 완료되었습니다."
            }
            res.json({
                "resultCode": resultCode,
                "message": message
            });
        });
    } else {//일반회원
        let mNum = req.body.mNum;

        var params = [pTitle, pType, pField, pScale, pRecruitDue, pStart, pDue, pOn, pState, pWorkingTime, pPlan, pDesign, pDevelop, pStack, pDescription, mNum];

        var sql = "INSERT INTO init_new.project (pTitle, pType, pField, pScale, pRecruitDue, pStart, pDue, pOn, pState, pWorkingTime, pPlan, pDesign, pDevelop, pStack, pDescription, mNum)";
        sql += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

        conn.query(sql, params, function (err, result) {
            if (err) {
                console.error(err);
                resultCode = 500;
                message = "등록에 실패했습니다. 다시 시도해주세요";
            } else {
                resultCode = 200;
                message = "등록이 완료되었습니다."
            }
            res.json({
                "resultCode": resultCode,
                "message": message
            });
        });
    }
});
//프로젝트 참여 신청
app.post('/apply', async function (req, res) {
    console.log('/apply');

    let mNum = req.body.mNum;
    let pNum = req.body.pNum;
    let rPosition = req.body.rPosition;

    var resultCode, message;

    //글쓴이인지 확인
    CheckWriter(true,false, mNum, pNum)
        .then((isWriter) => {
            console.log("isWirter: " + isWriter);
            if (isWriter) {//글쓴이임
                resultCode = 400;
                message = "직접 개설한 프로젝트에는 지원할 수 없습니다.";
                res.json({
                    "resultCode": resultCode,
                    "message": message
                });
            } else {
                //중복 지원인지 체크
                var sql = "SELECT * FROM init_new.recruit WHERE mNum=? and pNum=?";
                conn.query(sql, [mNum, pNum], function (err, result) {
                    //console.log("result.length: " + result.length);
                    if (err) {
                        console.log(err);
                        resultCode = 500;
                        message = "지원에 실패했습니다. 다시 시도해주세요";
                        res.json({
                            "resultCode": resultCode,
                            "message": message
                        });
                    } else if (result.length !== 0) {//중복 지원
                        resultCode = 201;
                        message = "이미 지원한 프로젝트입니다";
                        res.json({
                            "resultCode": resultCode,
                            "message": message
                        });
                    } else {//중복지원이 아니라면
                        var sql2 = "INSERT INTO init_new.recruit (mNum, pNum, rPosition) VALUES(?,?,?)";
                        conn.query(sql2, [mNum, pNum, rPosition], function (err, result) {
                            if (err) {
                                console.error(err);
                                resultCode = 500;
                                message = "지원에 실패했습니다. 다시 시도해주세요";
                            } else {
                                resultCode = 200;
                                message = "지원완료되었습니다."
                            }
                            res.json({
                                "resultCode": resultCode,
                                "message": message
                            });
                        });
                    }
                });
            }
        })
        .catch((err) => {
            console.error(err);
        });
});
//프로젝트 참여 승인
//홈화면
//프로젝트 자세히 보기
app.post('/projectDetail', function(req,res){
    console.log('/projectDetail');
    let isCompany = req.body.isCompany;
    let userNum = req.body.userNum;
    let pNum = req.body.pNum;

    var resultCode, message, isWriter;

    //글쓴인지 확인
    isWriter = checkWriter(true, isCompany, userNum, pNum);

    //프로젝트 정보+승인된 사용자
    var sql = "SELECT P.*, R.rPoision, M.mNum, M.mName, M.mPhoto From init_new.project P "
    + "JOIN init_new.recruit R ON P.pNum = R.pNum "
    + "JOIN init_new.member M ON R.mNum = M.mNum "
    + " WHERE P.pNum=? and R.rApproval=1";

    var pTitle, pType, pFiedl, pScale, pRecruitStart, pRecruitDue, pStart, pDue;
    var pOn, pState, pWorkingTime, pPlan, pDesign, pDevelop, pStack, pDescription;

    conn.query(sql, pNum, function(err,result){
        if(err){
            console.error(err);
            resultCode = 500;
            message = "오류가 발생했습니다. 다시 시도해주세요.";
        }else {
            resultCode = 200;
            message = "검색 성공";
            for(var i=0; i<result.length; i++) {

            }
        }
    });
});
//피드 등록