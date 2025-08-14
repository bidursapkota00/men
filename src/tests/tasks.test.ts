import request from "supertest";
import app from "../app";
import { Task } from "../models/Task";
import { createTestUser, createTestUser2 } from "./setup";

describe("Tasks API", () => {
  let authToken1: string;
  let authToken2: string;
  let user1Id: string;
  let user2Id: string;

  beforeEach(async () => {
    const { token: token1, user: u1 } = await createTestUser();
    const { token: token2, user: u2 } = await createTestUser2();

    authToken1 = token1;
    authToken2 = token2;
    user1Id = u1._id.toString();
    user2Id = u2._id.toString();
  });
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const taskData = {
        title: "Test Task",
        description: "Test Description",
        priority: "high",
      };

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.completed).toBe(false);
    });
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test Task" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid data", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation error");
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: "Task 1",
          completed: false,
          priority: "low",
          createdBy: user1Id,
        },
        {
          title: "Task 2",
          completed: true,
          priority: "high",
          createdBy: user1Id,
        },
        {
          title: "Task 3",
          completed: false,
          priority: "medium",
          createdBy: user2Id,
        },
      ]);
    });

    it("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toHaveLength(3);
    });
  });
});
