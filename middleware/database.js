let mysql   = require("mysql"),
    util    = require("util");

// Andmebaasi avamine
let pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '8kti6c',
    database: "mydb",
    timezone: 'EET'
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
    // võtsin returni ära
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;