const mysql = require('mysql2/promise');

const db = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);

module.exports = {
    db
}