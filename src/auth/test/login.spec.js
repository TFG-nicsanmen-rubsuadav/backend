import request from "supertest";
import app from "../../app";
import initialData from "./initialCreation.js";

beforeAll(async () => {
  await request(app).post("/auth/register").send(initialData);
});

describe("Can login", () => {
  it("should login and return a token", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "testuser3@gmail.com",
      password: "@Password1234",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
