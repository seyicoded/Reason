const mysql = require('mysql2');

const db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);

module.exports = {
    db
}