import request from "supertest";

// local imports
import app from "../../app";
import { generatePhoneNumber } from "./utils.js";

describe("register tests", () => {
  const data = {
    name: "Test",
    lastName: "User",
    email: "testuser3@gmail.com",
    password: "@Password1234",
    phone: "696981567",
    birthDate: "10/07/1998",
  };

  beforeEach(async () => {
    await request(app).post("/auth/register").send(data);
  });

  it("should create a new user and return a token", async () => {
    const response = await fetch("https://randomuser.me/api/", {
      method: "GET",
    });

    const data = await response.json();

    const validData = {
      name: data.results[0].name.first,
      lastName: data.results[0].name.last,
      email: data.results[0].email.replace("example", "gmail"),
      password: "@Password1234",
      phone: generatePhoneNumber(),
      birthDate: "10/07/1998",
    };

    const res = await request(app).post("/auth/register").send(validData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail when the email is already in use", async () => {
    const res = await request(app).post("/auth/register").send(data);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("email", "Email already in use");
  });
});
