const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redis = require("redis");

const app = express();
const client = redis.createClient({
  url: process.env.REDIS_URL
});

client.on('error', err => {
  console.log('Error ' + err);
});

// express middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let roomStore = [];

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket IO Handler
io.on("connection", (socket) => {
  console.log("A user has joined the chat");
  socket.on("join_room", (data) => {
    // TODO(Reuben): Add room validation
    console.log("User joined room:", data);
    socket.join(data);
  });

  socket.on("send_message", (data) => {
    console.log(data, data.room);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("A user has left the platform");
  });
});

// REST Endpoints
app.get('/', (req, res) => {
  res.json({
    rooms: roomStore
  })
});

app.get('/login', async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  await client.get(username).then(storedPassword => {
    if (storedPassword == null) {
      res.json({
        authenticated: false,
        reason: "No user found"
      });
      return;
    }
    if (storedPassword == password) {
      res.json({
        authenticated: true
      });
      return;
    } else {
      res.json({
        authenticated: false,
        reason: "Incorrect password"
      });
      return;
    }
  });
});

// app.post('/register', async (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   if (await client.exists(username)) {
//     res.sendStatus(403);
//   } else {
//     await client.set(username, password);
//     res.sendStatus(200);
//   }
// });

app.post('/:room', (req, res) => {
  console.log("Creating room", req.params.room);
  roomStore.push(req.params.room);
  res.sendStatus(200);
});

app.delete('/:room', (req, res) => {
  console.log("Deleting room", req.params.room);
  roomStore = roomStore.filter(room => room != req.params.room);
  res.sendStatus(200);
})

server.listen(8080, () => {
  console.log("Server is running...");
  client.connect();
});