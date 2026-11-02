const mongoose = require("mongoose");
const AirQuality = require("../models/AirQuality");

const allowedFields = [
  "city",
  "station",
  "pm25",
  "pm10",
  "no2",
  "temperature",
  "humidity",
  "measuredAt",
  "source",
];

const validateFields = (body) => {
  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    return `Unknown fields: ${unknownFields.join(", ")}`;
  }

  return null;
};

const requiredFields = [
  "city",
  "station",
  "pm25",
  "pm10",
  "measuredAt",
];

const validateRequiredFields = (body) => {
  return requiredFields.every(
    (field) =>
      body[field] !== undefined &&
      body[field] !== null &&
      body[field] !== ""
  );
};

// CREATE: створення нового вимірювання
const createMeasurement = async (req, res, next) => {
  try {
    const unknownFieldError = validateFields(req.body);

    if (unknownFieldError) {
      return res.status(400).json({
        success: false,
        error: unknownFieldError,
      });
    }

    if (!validateRequiredFields(req.body)) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const measurement = await AirQuality.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Measurement created successfully",
      data: measurement,
    });
  } catch (error) {
    next(error);
  }
};

// READ: отримання всіх вимірювань
const getMeasurements = async (req, res, next) => {
  try {
    const { city, station, startDate, endDate } = req.query;

    const filter = {};

    if (city) filter.city = city;
    if (station) filter.station = station;

    if (startDate || endDate) {
      filter.measuredAt = {};

      if (startDate) {
        const start = new Date(startDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid startDate",
          });
        }

        filter.measuredAt.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid endDate",
          });
        }

        filter.measuredAt.$lte = end;
      }
    }

    const measurements = await AirQuality.find(filter).sort({
      measuredAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    next(error);
  }
};

// READ: отримання одного вимірювання за ID
const getMeasurementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid measurement ID",
      });
    }

    const measurement = await AirQuality.findById(id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE: повна заміна вимірювання
const updateMeasurement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid measurement ID",
      });
    }

    const unknownFieldError = validateFields(req.body);

    if (unknownFieldError) {
      return res.status(400).json({
        success: false,
        error: unknownFieldError,
      });
    }

    if (!validateRequiredFields(req.body)) {
      return res.status(400).json({
        success: false,
        error: "PUT requires all mandatory fields",
      });
    }

    const measurement = await AirQuality.findById(id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
    }

    const replacement = {
      city: req.body.city,
      station: req.body.station,
      pm25: req.body.pm25,
      pm10: req.body.pm10,
      no2: req.body.no2,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      measuredAt: req.body.measuredAt,
      source: req.body.source,
    };

    measurement.set(replacement);

    const updatedMeasurement = await measurement.save();

    return res.status(200).json({
      success: true,
      message: "Measurement replaced successfully",
      data: updatedMeasurement,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH: часткове оновлення вимірювання
const patchMeasurement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid measurement ID",
      });
    }

    const unknownFieldError = validateFields(req.body);

    if (unknownFieldError) {
      return res.status(400).json({
        success: false,
        error: unknownFieldError,
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields provided for update",
      });
    }

    const measurement = await AirQuality.findById(id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
    }

    measurement.set(req.body);

    const updatedMeasurement = await measurement.save();

    return res.status(200).json({
      success: true,
      message: "Measurement updated successfully",
      data: updatedMeasurement,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: видалення вимірювання
const deleteMeasurement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid measurement ID",
      });
    }

    const measurement = await AirQuality.findByIdAndDelete(id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        error: "Measurement not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeasurement,
  getMeasurements,
  getMeasurementById,
  updateMeasurement,
  patchMeasurement,
  deleteMeasurement,
};