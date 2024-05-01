import request from "supertest";

// local imports
import app from "../../app";
import { generatePhoneNumber } from "./utils.js";
import testCases from "./testNegativeCases.js";
import initialData from "./initialCreation.js";

beforeEach(async () => {
  await request(app).post("/auth/register").send(initialData);
});

describe("Can register user", () => {
  it("should create a new user with role customer and return a token", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Usuario1",
      lastName: "Test",
      email: "cmuller@gmail.com",
      password: "@Password1234",
      phone: generatePhoneNumber(),
      birthDate: "10/07/1998",
      rol: "customer",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
  });
});

// Negative test cases
describe("Can't register user", () => {
  testCases.forEach(
    ({
      description,
      data,
      expectedStatusCode,
      expectedProperty,
      expectedErrorMessage,
    }) => {
      it(description, async () => {
        const res = await request(app).post("/auth/register").send(data);
        expect(res.statusCode).toEqual(expectedStatusCode);
        expect(res.body).toHaveProperty(expectedProperty, expectedErrorMessage);
      });
    }
  );
});
