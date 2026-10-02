const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const todoRoutes = require("./routes/todo.routes");

const app = express();

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Intro to DevOps API",
    status: "running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/todos", todoRoutes);

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
});

module.exports = app;