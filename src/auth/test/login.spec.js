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

  it("should not login with missing email", async () => {
    const res = await request(app).post("/auth/login").send({
      password: "prueba",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.email).toEqual("Email is required");
  });

  it("should not login with missing password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "prueba@gmail.com",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.password).toEqual("Password is required");
  });

  it("should not login with invalid email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "prueba",
      password: "prueba",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.email).toEqual("Invalid email");
  });
});
