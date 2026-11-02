const mongoose = require("mongoose");

const airQualitySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    station: {
      type: String,
      required: [true, "Station is required"],
      trim: true,
    },

    pm25: {
      type: Number,
      required: [true, "PM2.5 value is required"],
      min: [0, "PM2.5 cannot be negative"],
    },

    pm10: {
      type: Number,
      required: [true, "PM10 value is required"],
      min: [0, "PM10 cannot be negative"],
    },

    no2: {
      type: Number,
      min: [0, "NO2 cannot be negative"],
    },

    temperature: {
      type: Number,
    },

    humidity: {
      type: Number,
      min: 0,
      max: 100,
    },

    measuredAt: {
      type: Date,
      required: [true, "Measurement date is required"],
    },

    source: {
      type: String,
      default: "Демонстраційні дані",
    },
  },
  {
    timestamps: true,
  }
);

const AirQuality = mongoose.model("AirQuality", airQualitySchema);

module.exports = AirQuality;