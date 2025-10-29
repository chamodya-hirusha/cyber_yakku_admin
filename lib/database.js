import mysql from 'mysql2/promise';

// Use a pool to avoid single-connection fatal errors and auto-manage reconnects
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '9#Jc4$kB2ED',
  database: process.env.DB_NAME || 'cms_db',
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: false,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  keepAliveInitialDelay: 0,
  enableKeepAlive: true,
  ssl: false,
});

// Enhanced connection testing with retry logic
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('MySQL pool established. Connection id ' + conn.threadId);
      conn.release();
      return true;
    } catch (err) {
      console.error(`MySQL connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) {
        console.error('All MySQL connection attempts failed');
        return false;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// Test the connection
testConnection();

// Handle pool errors
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