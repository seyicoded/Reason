const mysql = require('mysql2');
require('dotenv').config()

// MYSQL_USERNAME=
// MYSQL_PASSWORD=
// MYSQL_HOST=
// MYSQL_DB=

const getDB = ()=>{
    // console.log(process.env.MYSQL_HOST)
    const db = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
    });
    return db;
};

module.exports = {
    getDB
}