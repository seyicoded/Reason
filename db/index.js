const mysql = require('mysql2');
// const mysqlp = require('mysql2/promise');
require('dotenv').config()

// MYSQL_USERNAME=
// MYSQL_PASSWORD=
// MYSQL_HOST=
// MYSQL_DB=

var db = null;

const getDB = ()=>{
    try {
        // console.log(process.env.MYSQL_HOST)
        db = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB
        });

        db.connect(function (err) { // The server is either down
            if (err) { // or restarting (takes a while sometimes).
                console.log('error when connecting to db:', err);
                setTimeout(getDB, 2000); // We introduce a delay before attempting to reconnect,
            } // to avoid a hot loop, and to allow our node script to
        }); // process asynchronous requests in the meantime.
        // If you're also serving http, display a 503 error.
        db.on('error', function (err) {
            console.log('db error', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
                getDB(); // lost due to either server restart, or a
            } else { // connnection idle timeout (the wait_timeout
                setTimeout(()=>{
                    getDB();
                }, 5000)
                console.log(err); // server variable configures this)
            }
        });      
    } catch (error) {
        return null;
    }
    
};

getDB();
setInterval(function () {
    db.query('SELECT 1');
}, 5000);

module.exports = {
    getDB: db,
}

// 3106-2737-3951