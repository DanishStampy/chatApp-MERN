const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/dummy");
const connectDB = require("./config/db");
const colors = require("colors");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const { notFound, errHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); // To accept JSON data

app.get("/", (req, res) => {
  res.send("API is running sucessfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound)
app.use(errHandler)

// app.get('/api/chat', (req, res) => {
//   res.send(chats);
// })

// app.get('/api/chat/:id', (req, res) => {
//   //console.log(req.params.id)
//   const singleChat = chats.find((c) => c._id === req.params.id);
//   res.send(singleChat);
// });

// Listen PORT
const PORT = process.env.PORT || 3000;

app.listen(`${PORT}`, console.log(`Server started on ${PORT}`.yellow.bold));
