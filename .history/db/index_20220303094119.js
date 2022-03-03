const mysql = require('mysql2');

const connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
