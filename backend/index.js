const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

let roomStore = [
  "Room1",
  "Room2",
  "Room3"
];

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
});