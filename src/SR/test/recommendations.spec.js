import request from "supertest";

// local imports
import app, { saveDataToFirebase } from "../../app";
import { generateRandomReviews } from "../utils/utils.js";
import { mainUser10 } from "../../auth/test/mainUserForMiddelware.js";
import restaurantData from "./initialRestaurantData.js";

let token;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
  const response = await request(app).post("/auth/register").send(mainUser10);
  //   await generateRandomReviews();
  token = response.body.token;
});

describe("Using SR", () => {
  it("Can not get recommendations without login", async () => {
    const response = await request(app).get("/api/recommendations");
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual("You need to login to use the RS");
  });
  it("Can get recommendations cause invalid token login", async () => {
    const response = await request(app)
      .get("/api/recommendations")
      .set("Authorization", "Bearer invalidToken");
    expect(response.statusCode).toEqual(403);
    expect(response.body.message).toEqual("Invalid login token");
  });
  //   it("Can get recommendations", async () => {
  //     const response = await request(app)
  //       .get("/api/recommendations")
  //       .set("Authorization", token);
  //     expect(response.statusCode).toEqual(200);
  //     expect(response.body).toHaveProperty("recommendations");
  //   });
});
