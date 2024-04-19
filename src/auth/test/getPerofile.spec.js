import request from "supertest";
import app from "../../app";
import initialData from "./initialCreation.js";

let uid;

beforeAll(async () => {
  const response = await request(app).post("/auth/register").send(initialData);
  uid = response.body.uid;
});

describe("Can get profile", () => {
  it("should get profile", async () => {
    const res = await request(app).get(`/auth/profile/${uid}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("displayName");
    expect(res.body).toHaveProperty("rol");
  });

  it("should not get profile", async () => {
    const res = await request(app).get(`/auth/profile/123`);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("error");
  });
});
