const express = require('express');
const morgan = require('morgan');
const cookieParser = reqire('cookie-parser');
const session = require('express-session');
const dotenv = reqire('dotenv');

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