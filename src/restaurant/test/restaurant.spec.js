import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";

let restaurantId;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
}, 20000);

describe("Getting all the restaurants", () => {
  it("Can get all restaurants", async () => {
    const res = await request(app).get("/api/restaurants");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("Testing trying to show restaurant", () => {
  it("invalid restaurantId", async () => {
    const res = await request(app).get("/api/restaurant/invalidId");
    expect(res.statusCode).toBe(404);
  });

  it("valid restaurantId", async () => {
    const res = await request(app).get(`/api/restaurant/${restaurantId}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("Testing searching for a restaurant", () => {
  it("invalid query parameters", async () => {
    const res = await request(app).get("/api/restaurant/search");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Missing query parameters");
  });

  it("valid query parameters", async () => {
    const res = await request(app).get(
      `/api/restaurant/search?name=${
        restaurantData[0].restaurantName
      }&city=${restaurantData[0].fullAddress.split(", ").pop()}`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("Testing getting the number of restaurants", () => {
  it("Can get the number of restaurants", async () => {
    const res = await request(app).get("/api/restaurants/count");
    expect(res.statusCode).toBe(200);
    expect(res.body.numberOfRestaurants).toBeGreaterThan(0);
  });
});

describe("Testing getting the number of cities", () => {
  it("Can get the number of cities", async () => {
    const res = await request(app).get("/api/restaurants/numberOfCities");
    expect(res.statusCode).toBe(200);
    expect(res.body.numberOfCities).toBeGreaterThan(0);
  });
});

describe("Testing getting all cities", () => {
  it("Can get all cities", async () => {
    const res = await request(app).get("/api/restaurants/cities");
    expect(res.statusCode).toBe(200);
    expect(res.body.cities.length).toBeGreaterThan(0);
  });
});

describe("Testing getting the number of opinions", () => {
  it("Can get the number of opinions", async () => {
    const res = await request(app).get("/api/restaurants/numberOfOpinions");
    expect(res.statusCode).toBe(200);
    expect(res.body.numberOfOpinions).toBeGreaterThan(0);
  });
});
