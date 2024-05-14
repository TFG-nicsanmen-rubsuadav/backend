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
