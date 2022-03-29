const rateLimit = require('express-rate-limit')
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const redis = require("redis");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");
const e = require("express");
const dotenv = require("dotenv");

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const JWT_SECRET = process.env.JWT_SECRET || '';

const app = express();
const client = redis.createClient({
  url: process.env.REDIS_URL || ''
});

client.on('error', err => {
  console.log('Error ' + err);
});

//rate limiter being configured here
const limiter = rateLimit({
  windowMS: 60 * 100, //this enforces a 1-minute window for our rate limiter
  max: 5              //> of which we can only make 5 requests in that 1 minute
});

// express middleware
app.use(cors({
  credentials: true,
  origin: true
}));
app.use(express.json());
app.use(require('sanitize').middleware);  //for sanitizing inputs
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

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
    req.room = data.room;
    req.room = data.role;
    return next();
  } catch {
    return res.status(403);
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

app.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
  //This needs fixing as per https://github.com/ReubenMathew/HelpDesk/security/code-scanning/130
  await client.get(username).then(storedPassword => {
    if (storedPassword == null) {
      res
        .status(403)
        .json({
          authenticated: false,
          reason: "No user found"
        });
      return;
    }
    if (storedPassword == password) {
      console.log(username, "logged in", token);
      res
        .json({
          authenticated: true,
          token: token
        })
        .status(200);
      return;
    } else {
      res.json({
        authenticated: false,
        reason: "Incorrect password"
      }).status(403);
      return;
    }
  });
});

app.post('/enqueue', (req, res) => {
  const room = req.query.room;
  const token = jwt.sign({ room: room, role: "user" }, JWT_SECRET);
  console.log("User has been queued to", room);
  return res
    .status(201)
    .cookie("access_token", token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      httpOnly: true,
    })
    .json({
      message: "Queued successfully",
      token: token
    });
});

// verification endpoint for JWT tokens
app.post("/verifyRoom", authorization, (req, res) => {
  const token = req.cookies.access_token;
  const room = req.query.room;
  const data = jwt.verify(token, JWT_SECRET);
  const token_role = data.role;
  const token_room = data.room;
  console.log(data, token_role, "attempting to join room", room, "with", token_room);
  if (token_room === room || token_role === 'admin') {
    return res
      .status(200)
      .json({
        authentication: true
      });
  }
  return res
    .status(403)
    .json({
      authentication: false
    });
});

app.post('/requeue/:room', (req, res) => {
  console.log("Requeueing room", req.params.room);
  const roomToAdd = req.params.room
  if (!roomStore.includes(roomToAdd)) {
    roomStore.push(roomToAdd);
  }
  res
    .status(201)
    .json({
      message: "Successfully requeued room"
    });
});

app.post('/:room', (req, res) => {
  console.log("Creating room", req.params.room);
  const roomToAdd = req.params.room
  if (!roomStore.includes(roomToAdd)) {
    roomStore.push(roomToAdd);
  }
  res
    .status(201)
    .json({
      message: "Successfully entered room"
    });
});

app.delete('/:room', (req, res) => {
  console.log("Deleting room", req.params.room);
  roomStore = roomStore.filter(room => room != req.params.room);
  res.sendStatus(202);
})

server.listen(8080, () => {
  console.log("Server is running on port 8080...");
  client.connect();
});
