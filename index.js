const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
const PORT = 5000;
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { addUser, addMessages, getChatHistory } = require('./utils/handleUsers');

app.use(cors());
app.use(express.json());

// app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

const users = {};
const userSocketIdMaps = []

io.on("connection", function (socket) {
    //   console.log('a user connected');

    socket.on("join", function (username) {
        // console.log("username :>> ", username);
        users[socket.id] = username.from;
        const newUser = {
            username: username.from,
            password: 'damn niggs',
            email: username.from + '@gmail.com'
        }
        const User = addUser(newUser);
        // console.log('User', User)

        userSocketIdMaps.push({
            socketId: socket.id,
            username: User.username,
        })
        console.log(users[socket.id] + " joined the chat");
        // console.log('users :>> ', users);
        // console.log('userSocketIdMaps', userSocketIdMaps)
    });

    socket.on("private message", (data) => {
        addMessages(data.from, data.to, data.message);
        // console.log(users, "lol");
        const to = data.to;
        // console.log("to", to);

        const recipientSocketId = Object.keys(users).find(
            (socketId) => users[socketId] === data.to
        );

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("private message", {
                from: data.from,
                to: data.to,
                message: data.message,
            });
        }
    });

    socket.on("disconnect", function () {
        console.log(users[socket.id] + " disconnected");
        delete users[socket.id];
        // pool.end();
    });
});

//create a transaction
app.post("/transactions", async (req, res) => {
    try {
        const { item, price, record_time } = req.body;
        console.log('body', item, price, record_time);

        const newTrans = await pool.query(
            "INSERT INTO transactions (item, price, record_time) VALUES ($1, $2, $3) RETURNING *",
            [item, price, record_time]
        );
        res.json(newTrans.rows[0]);
    } catch (error) {
        console.log(error.message);
    }
});

app.get('/getHistory', (req, res) => {
    getChatHistory('arun', 'sakshi').then(arr => {
        console.log('arr', arr);
        res.json(arr);
    }).catch(_=>{
        res.end();
    });
})

http.listen(PORT, () => {
    console.log("Server has started on port " + PORT);
});