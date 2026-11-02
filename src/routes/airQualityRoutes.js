const express = require("express");

const {
  createMeasurement,
  getMeasurements,
  getMeasurementById,
  updateMeasurement,
  patchMeasurement,
  deleteMeasurement,
} = require("../controllers/airQualityController");

const router = express.Router();

router.post("/", createMeasurement);

router.get("/", getMeasurements);

router.get("/:id", getMeasurementById);

router.put("/:id", updateMeasurement);

router.patch("/:id", patchMeasurement);

router.delete("/:id", deleteMeasurement);

module.exports = router;