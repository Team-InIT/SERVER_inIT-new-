//데이터베이스 설정
const db_config = require('./config');
const conn = db_config.init();

function dbCheck(isProject, userNum, postNum) {
    console.log('checkWriter 함수 실행');
    
}

//글쓴이 확인
async function checkWriter(isProject, userNum, postNum) {
    return new Promise((resolve,reject) => {
        if (isProject) {//프로젝트 글쓴이인지 체크
            var sql = "SELECT * FROM init_new.project WHERE pNum=? and mNum=?";
            conn.query(sql, [postNum, userNum], function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    if (result.length !== 0) {
                        console.log('true 리턴');
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        } else {//피드 글쓴이인지 체크
            var sql = "SELECT * FROM init_new.feed WHERE fNum=? and mNum=?";
            conn.query(sql, [postNum, userNum], function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    if (result.length !== 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        }
    })
    
}

module.exports = checkWriter;