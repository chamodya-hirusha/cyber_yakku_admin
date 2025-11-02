import mysql from 'mysql2/promise';

// Create the pool without making a connection at import time
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || '142.91.102.23',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'imesh',
  password: process.env.DB_PASSWORD || 'Imesh2001@',
  database: process.env.DB_NAME || 'mta_db',
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: false,
  connectTimeout: 30000,  // Keep this
  // Remove the 'timeout' option as it's not valid
  keepAliveInitialDelay: 0,
  enableKeepAlive: true,
  ssl: false,
});

// Attach listeners (no connection is opened until first use)
pool.on('connection', (connection) => {
  console.log('New MySQL connection established as id ' + connection.threadId);
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('MySQL connection lost, pool will handle reconnection');
  }
});

export default pool;