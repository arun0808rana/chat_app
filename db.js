// const Pool = require("pg").Pool;

// const pool = new Pool({
//   user: "test",
//   password: "pswd001",
//   host: "localhost",
//   port: "5432",
//   database: "pern_transactions",
// });

// module.exports = pool;


const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '94174864889',
    port: 5432,
});

const db_name = 'chat_app_db';
const user_name = 'chat_app_user';
const pswd = '94174864889';
const table_name = ''

// pool.on('connect', () => {
//     console.log('Connected to the database');
// });

// Create the user if it does not exist
pool.query(`CREATE USER "${user_name}" WITH PASSWORD '${pswd}'`, (err, res) => {
    if (err) {
        console.error('[Error]: creating user', err.message);
    } else {
        console.log('User created or already exists');
    }
});

// Create the database if it does not exist
pool.query(`CREATE DATABASE ${db_name}`, (err, res) => {
    if (err) {
        console.error('[Error]: creating database', err.message);
    } else {
        console.log('Database created or already exists');
    }
});



// Grant privileges to the user
pool.query(`GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${user_name}`, (err, res) => {
    if (err) {
        console.error('[Error]: granting previleges.', err.message);
    } else {
        console.log('Privileges granted to user');
    }
});

// Create the users table if it does not exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`;
pool.query(createUsersTable)
    .then(() => console.log('User table created successfully'))
    .catch(err => console.log('Error creating user table', err));

// create the messages table if it does not exist
const createMessagesTable = `
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    media_address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT at_least_one_field_not_null CHECK (content IS NOT NULL OR media_address IS NOT NULL)
  );
`;
pool.query(createMessagesTable)
    .then(() => console.log('Messages table created successfully'))
    .catch(err => console.log('Error creating Messages table', err));


module.exports = pool;
