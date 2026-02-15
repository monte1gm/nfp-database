import mysql from "mysql2/promise";

const {
  CLOUD_SQL_CONNECTION_NAME,
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

if (!MYSQL_USER || !MYSQL_DATABASE) {
  console.error("MySQL configuration missing required env vars");
}

const connectionConfig = CLOUD_SQL_CONNECTION_NAME
  ? {
      socketPath: `/cloudsql/${CLOUD_SQL_CONNECTION_NAME}`,
    }
  : {
      host: MYSQL_HOST || "127.0.0.1",
      port: Number(MYSQL_PORT || 3306),
    };

console.log(
  CLOUD_SQL_CONNECTION_NAME
    ? `Using Cloud SQL socket: /cloudsql/${CLOUD_SQL_CONNECTION_NAME}`
    : `Using TCP MySQL connection: ${connectionConfig.host}:${connectionConfig.port}`
);

export const pool = mysql.createPool({
  ...connectionConfig,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,

  // makes cold starts much more reliable on Cloud Run
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
