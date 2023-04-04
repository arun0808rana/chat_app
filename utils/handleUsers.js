const pool = require('../db')

async function addUser(user) {
    const { username, password, email } = user;
    let User = await findUserByUsername(username);
    console.log('Usr', User);

    if (!User) {
        try {
            await new Promise((resolve, reject) => {
                pool.query(`INSERT INTO users (username, password, email) VALUES ($1, $2, $3)`, [username, password, email], (err, res) => {
                    if (err) {
                        console.error('[Error]: adding user: ', err.message);
                        reject();
                    } else {
                        console.log(`[New user] ${username} added.`);
                        // console.log('res', res)
                        return findUserByUsername(username);
                    }
                    // pool.end(); // close the pool after the query is executed
                    resolve()
                });
            })
        } catch (error) {
            handleError(error);
            return user;
        }
    } else {
        console.log('User Already Exists.');
        return User;
    }
}

async function addMessages(senderUsername, recipientUsername, message) {
    const Sender = await findUserByUsername(senderUsername);
    const Recipient = await findUserByUsername(recipientUsername);
    console.log('Sender', Sender)

    if (Sender && Recipient) {
        pool.query(`INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3)`, [Sender.id, Recipient.id, message], (err, res) => {
            if (err) {
                console.error('[Error]: adding message: ', err.message);
            } else {
                console.log(`[New message] added.`);
                // console.log('res', res)
                return res;
            }
        });
    } else {
        console.error('Couldnt find sender or recipient');
    }
}

function handleError(error) {
    console.error('[Error]:', error?.message)
}

async function findUserByUsername(username) {
    return await new Promise((resolve, reject) => {
        try {
            pool.query(`SELECT * FROM users WHERE username=$1`, [username], (err, res) => {
                if (err) {
                    console.error('[Error]: finding user', err.message);
                } else if (res.rows.length === 0) {
                    console.log(`User with username ${username} not found`);
                } else {
                    // console.log(`Found:`, res.rows[0]);
                    resolve(res.rows[0]);
                }
                // pool.end(); // close the pool after the query is executed
            });
        } catch (error) {
            handleError(error);
            reject(null);
        }
    })
}

async function getChatHistory(user1, user2) {
    const User1 = await findUserByUsername(user1);
    const User2 = await findUserByUsername(user2);

    if(User1 && User2){
        return await new Promise((resolve, reject) => {
            try {
                pool.query(`SELECT * FROM messages WHERE sender_id = $1 AND recipient_id = $2`, [User1.id, User2.id], (err, res) => {
                    // console.log('res', res.rows)
                    if (err) {
                        console.error('[Error]: finding chat history', err.message);
                    } else if (res.rows.length === 0) {
                        console.log(`Messages could not found`);
                        reject([]);
                    } else {
                        // console.log(`Found:`, res.rows[0]);
                        resolve(res.rows);
                    }
                    // pool.end(); // close the pool after the query is executed
                });
            } catch (error) {
                handleError(error);
                reject([]);
            }
        })
    }
}

module.exports = {
    addUser,
    addMessages,
    getChatHistory
}