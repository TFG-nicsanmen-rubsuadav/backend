import request from "supertest";
import app from "../../app";

describe("Can visit documentation", () => {
  it("should return the swagger documentation", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
