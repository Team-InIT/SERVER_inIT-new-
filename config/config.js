const mysql = require('mysql');

const conn = { //mysql 모듈 로드
    host: 'init-database.cokbdsvii3vg.ap-northeast-2.rds.amazonaws.com',
    post: '3306',
    user: 'root',
    password: 'Dbswjd0423!',
    database: 'init_new',
    multipleStatements: true //다중쿼리 지원
};

const db = {
    init: () => {
        return mysql.createConnection(conn);
    },
    connect: (conn) => {
        conn.connect((err) => {
            if(err) {
                console.error('mysql connection error: ', err);
            }
            else {
                console.log('mysql connected successfully');
            }
        });
    },
};

module.exports = db;