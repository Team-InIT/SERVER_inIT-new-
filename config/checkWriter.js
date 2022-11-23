//데이터베이스 설정
const db_config = require('./config');
const conn = db_config.init();

//글쓴이 확인

async function checkWriter(isProject, isCompany, userNum, postNum) {
    return new Promise((resolve,reject) => {
        var sql;
        if (isProject) {//프로젝트 글쓴이인지 체크
            if(isCompany) {//기업 개설 프로젝트
                sql = "SELECT * FROM init_new.project WHERE pNum=? and cNum=?";
            } else{//개인 개설 프로젝트
                sql = "SELECT * FROM init_new.project WHERE pNum=? and mNum=?";
            }
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
        } else {//피드 글쓴이인지 체크
            if(isCompany) {
                sql = "SELECT * FROM init_new.feed WHERE fNum=? and cNum=?";
            }else {
                sql = "SELECT * FROM init_new.feed WHERE fNum=? and mNum=?";
            }
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
    });
}

module.exports = checkWriter;