const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();


// ==========================================
// MYSQL CONNECTION POOL
// ==========================================

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});


// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

async function testDatabaseConnection() {

    try {

        const connection = await pool.getConnection();

        console.log(
            'MySQL database connected successfully.'
        );

        connection.release();

    } catch (error) {

        console.error(
            'MySQL database connection failed.'
        );

        console.error(error.message);

    }
}


module.exports = {
    pool,
    testDatabaseConnection
};