// Express aur Socket.IO ka import
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Database aur routes import kiye
const connectedDB = require("./config/db");
const users = require("./routers/route");
const sendMail = require("./Controller/sendMail");

const app = express();
const server = http.createServer(app);

// Socket.IO ka server setup kiya with CORS allow from all origins
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Map banaya users ka — yeh userID aur unke socketID store karega
const usersMap = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Jab client user apna ID register karta hai
  socket.on("register_user", (userId) => {
    usersMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    io.emit("user_online", userId);
  });

  // Private message bhejna
  socket.on("send_private_message", ({ to, from, message, file }) => {
    const targetSocketId = usersMap.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive_private_message", {
        from,
        message,
        file: file || null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      });
    } else {
      console.log(`User ${to} not connected`);
    }
  });

  // 📞 Video call events
// call_user
socket.on("call_user", ({ to, from, name, type }) => {
  const targetSocketId = usersMap.get(to);
  if (targetSocketId) {
    console.log(`Incoming ${type || "video"} call from ${from} -> ${to}`);
    io.to(targetSocketId).emit("incoming_call", { from, name, type });
  }
});

// accept_call
socket.on("accept_call", ({ to, from, type }) => {
  const targetSocketId = usersMap.get(to);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call_accepted", { from, type });
  }
});



  socket.on("reject_call", ({ to, from }) => {
    const targetSocketId = usersMap.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("call_rejected", { from });
    }
  });

  // WebRTC signaling
  socket.on("webrtc-offer", (data) => {
    const targetSocketId = usersMap.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-offer", data);
    }
  });

  socket.on("webrtc-answer", (data) => {
    const targetSocketId = usersMap.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-answer", data);
    }
  });

  socket.on("webrtc-ice", (data) => {
    const targetSocketId = usersMap.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-ice", data);
    }
  });

  socket.on("webrtc-end", (data) => {
    const targetSocketId = usersMap.get(data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webrtc-end", data);
    }
  });

  // Disconnect
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
  });

  // Online users list
  socket.on("get_online_users", () => {
    socket.emit("online_users", [...usersMap.keys()]);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Database connect
connectedDB();

// Routes
app.use("/api", users);
app.get("/sendemail", sendMail);
app.get("/", (req, res) => {
  res.send("hello");
});

// Server start
const port = 4000;
server.listen(port, () => {
  console.log("Server is running on port", port);
});
