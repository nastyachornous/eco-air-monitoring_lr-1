const express = require("express");
const cors = require("cors");

const airQualityRoutes = require("./routes/airQualityRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Головна сторінка API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Eco Air Monitoring API is running",
  });
});

// Маршрути вимірювань
app.use("/api/air-quality", airQualityRoutes);

// Обробка неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Обробка помилок
app.use((error, req, res, next) => {
  console.error(error);

  if (
    error.name === "ValidationError" ||
    error.name === "CastError" ||
    error.type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

module.exports = app;