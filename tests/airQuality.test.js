require("dotenv").config({ path: ".env.test" });

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const AirQuality = require("../src/models/AirQuality");

const testMeasurement = {
  city: "Тестове місто",
  station: "Тестова станція",
  pm25: 15,
  pm10: 30,
  no2: 10,
  temperature: 20,
  humidity: 50,
  measuredAt: "2026-11-01T10:00:00.000Z",
  source: "Тестові дані",
};

let measurementId;

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error("MONGODB_TEST_URI is not configured in .env.test");
  }

  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

afterEach(async () => {
  await AirQuality.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Air Quality API", () => {
  test("має створити нове вимірювання", async () => {
    const response = await request(app)
      .post("/api/air-quality")
      .send(testMeasurement)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.city).toBe("Тестове місто");
    expect(response.body.data.pm25).toBe(15);

    measurementId = response.body.data._id;
  });

  test("має отримати всі вимірювання", async () => {
    await AirQuality.create(testMeasurement);

    const response = await request(app)
      .get("/api/air-quality")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.count).toBe(1);
  });

  test("має отримати вимірювання за ID", async () => {
    const measurement = await AirQuality.create(testMeasurement);

    const response = await request(app)
      .get(`/api/air-quality/${measurement._id}`)
      .expect(200);

    expect(response.body.data.city).toBe("Тестове місто");
  });

  test("має повністю оновити вимірювання", async () => {
    const measurement = await AirQuality.create(testMeasurement);

    const updatedData = {
      ...testMeasurement,
      pm25: 25,
      pm10: 40,
    };

    const response = await request(app)
      .put(`/api/air-quality/${measurement._id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.data.pm25).toBe(25);
    expect(response.body.data.pm10).toBe(40);
  });

  test("має частково оновити вимірювання", async () => {
    const measurement = await AirQuality.create(testMeasurement);

    const response = await request(app)
      .patch(`/api/air-quality/${measurement._id}`)
      .send({ pm25: 12 })
      .expect(200);

    expect(response.body.data.pm25).toBe(12);
    expect(response.body.data.pm10).toBe(30);
  });

  test("має видалити вимірювання", async () => {
    const measurement = await AirQuality.create(testMeasurement);

    await request(app)
      .delete(`/api/air-quality/${measurement._id}`)
      .expect(204);

    const deletedMeasurement = await AirQuality.findById(measurement._id);

    expect(deletedMeasurement).toBeNull();
  });

  test("має повертати 400 для неправильних даних", async () => {
    const response = await request(app)
      .post("/api/air-quality")
      .send({ city: "Тестове місто" })
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  test("має повертати 404 для неіснуючого вимірювання", async () => {
    const response = await request(app)
      .get("/api/air-quality/507f1f77bcf86cd799439011")
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});