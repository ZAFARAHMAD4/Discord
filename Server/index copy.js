const express = require("express");
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectedDB = require("./config/db");
const users = require("./routers/route");
const sendMail = require('./Controller/sendMail');

const app = express();
const server = http.createServer(app); // ✅ Needed for Socket.IO

const io = new Server(server, {
  cors: {
    origin: '*', // or set to 'http://localhost:3000' for dev
    methods: ['GET', 'POST']
  }
});

const usersMap = new Map(); // key: userId/email, value: socketId


// // ✅ Socket.IO connection
// io.on('connection', (socket) => {
//   console.log('A new user has connected:', socket.id);

//   socket.on('send_message', (data) => {
//     io.emit('receive_message', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When user joins, they send their identifier
  socket.on('register_user', (userId) => {
    usersMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // One-to-one messaging
  socket.on('send_private_message', ({ to, from, message }) => {
    const targetSocketId = usersMap.get(to);

    if (targetSocketId) {
      io.to(targetSocketId).emit('receive_private_message', {
        from,
        message,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      });
    } else {
      console.log(`User ${to} not connected`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [key, value] of usersMap.entries()) {
      if (value === socket.id) {
        usersMap.delete(key);
        break;
      }
    }
  });
});


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

connectedDB();

app.use('/api', users);

app.get("/sendemail", sendMail);

app.get('/', (req, res) => {
  res.send("hello");
});

// ✅ Start using the HTTP server, not just Express
const port = 3000;
server.listen(port, () => {
  console.log("Server is running on port", port);
});
