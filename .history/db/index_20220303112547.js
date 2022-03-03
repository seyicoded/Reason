const mysql = require('mysql2/promise');
require('dotenv').config()

const getDB = async()=>{
    const db = await mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
    return db;
};

module.exports = {
    getDB
}