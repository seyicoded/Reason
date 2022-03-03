const mysql = require('mysql2/promise');

const getDB = async()=>{
    const db = await mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
    return db
};

module.exports = {
    getDB
}