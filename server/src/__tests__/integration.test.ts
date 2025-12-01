import express, { Request, Response } from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

// Simple test app setup
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
  });

  app.post("/api/echo", (req: Request, res: Response) => {
    res.status(200).json({ data: req.body });
  });

  return app;
};

describe("API Integration Tests", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Setup in-memory MongoDB for integration tests
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("GET /api/health", () => {
    it("should return 200 and status ok", async () => {
      const app = createTestApp();
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "ok",
        message: "Server is running",
      });
    });
  });

  describe("POST /api/echo", () => {
    it("should echo back the request body", async () => {
      const app = createTestApp();
      const testData = { message: "Hello, World!" };

      const response = await request(app).post("/api/echo").send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: testData });
    });

    it("should handle empty body", async () => {
      const app = createTestApp();

      const response = await request(app).post("/api/echo").send({});

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: {} });
    });
  });

  describe("Database Connection", () => {
    it("should be connected to MongoDB", () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });

    it("should have the correct database name", () => {
      expect(mongoose.connection.name).toBeTruthy();
    });
  });
});
