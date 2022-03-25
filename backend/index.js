const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redis = require("redis");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

//TODO(Reuben): Change this before committing
const JWT_SECRET = "MY_SECRET";

const app = express();
const client = redis.createClient({
  //TODO(Reuben): Change this before committing
  url: 'redis://default:6sqjQ7bIiFWbRMicd4YS@containers-us-west-27.railway.app:7372'
});

client.on('error', err => {
  console.log('Error ' + err);
});

// express middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

  socket.on("send_image", (data) => {
    console.log("Image received from", data.author, data.room);
    socket.to(data.room).emit("receive_image", data);
    console.log("Image sent to", data.room);
  });

  socket.on("disconnect", () => {
    console.log("A user has left the platform");
  });
});

// Custom Auth Middleware
const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res
      .status(403)
      .json({ message: "Proper authentication not supplied" });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.userId = data.id;
    req.userRole = data.role;
    console.log(data.id, data.role);
    return next();
  } catch {
    return res.access_tokensendStatus(403);
  }
}

// REST Endpoints
app.get('/', (req, res) => {
  return res
          .status(200)
          .json({
            rooms: roomStore
          });
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

app.get("/protected", authorization, (req, res) => {
  return res.json({ user: { id: req.userId, role: req.userRole } });
});

app.post('/enqueue', (req, res) => {
  const token = jwt.sign({ id: 1, role: "user"}, JWT_SECRET);
  return res
    .status(201)
    .cookie("access_token", token, {})
    .json({
      message: "Queued successfully"
    });
});

app.post('/:room', authorization, (req, res) => {
  console.log("Creating room", req.params.room);
  const roomToAdd = req.params.room
  if (!roomStore.includes(roomToAdd)) {
    roomStore.push(roomToAdd);
  }
  res
    .status(201)
    .cookie("room", roomToAdd, {})
    .json({
      message: "Successfully entered room"
    });
});

app.delete('/:room', (req, res) => {
  console.log("Deleting room", req.params.room);
  roomStore = roomStore.filter(room => room != req.params.room);
  res.clearCookie("room");
  res.sendStatus(202);
})

server.listen(8080, () => {
  console.log("Server is running...");
  client.connect();
});
