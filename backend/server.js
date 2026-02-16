const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
require("dotenv").config();
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

const app = express();

// 1. Connect to Database
connectDB();

// 2. Middleware
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message" , messageRoutes);


// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// 3. Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const io = require("socket.io")(server, {
    pingTimeout : 60000,
    cors: {
        origin : "http://localhost:5173",
    },
});

io.on("connection", (socket)=>{
    console.log("Connected to socket.io");

    // User connects and joins their own personal room (based on their ID)
    socket.on("setup", (userData)=> {
        if(!userData?._id) return;
        socket.join(userData._id);
        socket.emit("connected");
    });

    // User joins a specific chat room

    socket.on("join chat", (room) =>{
        socket.join(room);
        console.log("User joined room :" + room);
    });

    // Handling message

    socket.on("new message" , (newMessageRecieved) => {
        const chat = newMessageRecieved.chat;
        if(!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user)=> {
            if(user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message received" , newMessageRecieved);
        });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected");
    })
})

// 4. Handle unhandled promise rejections (Safety Net)
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});