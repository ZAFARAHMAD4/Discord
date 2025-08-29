// ==== server.js (Express + Socket.IO backend) ====

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectedDB = require("./config/db");
const users = require("./routers/route");
const sendMail = require("./Controller/sendMail");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const usersMap = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register_user", (userId) => {
    usersMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    io.emit("user_online", userId);
  });

  socket.on("send_private_message", ({ to, from, message }) => {
    const targetSocketId = usersMap.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive_private_message", {
        from,
        message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      });
    } else {
      console.log(`User ${to} not connected`);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    let disconnectedUser = null;
    for (let [key, value] of usersMap.entries()) {
      if (value === socket.id) {
        disconnectedUser = key;
        usersMap.delete(key);
        break;
      }
    }
    if (disconnectedUser) {
      io.emit("user_offline", disconnectedUser);
    }
  }

  );

  // 🆕 Handle request for current online users
 socket.on("get_online_users", () => {
    socket.emit("online_users", [...usersMap.keys()]);
  });
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
connectedDB();

app.use("/api", users);
app.get("/sendemail", sendMail);
app.get("/", (req, res) => {
  res.send("hello");
});

const port = 4000;
server.listen(port, () => {
  console.log("Server is running on port", port);
});
