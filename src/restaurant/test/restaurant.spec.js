import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { authenticateUser } from "../../auth/test/utils.js";
import { initialData, initialData2 } from "./initialOwnerId.js";

let restaurantId;
let restaurantId2;
let restaurantId3;
let restaurantId4;
let restaurantId5;
let userId;
let userId2;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
  restaurantId2 = snapshotData.docs[1].id;
  restaurantId3 = snapshotData.docs[2].id;
  restaurantId4 = snapshotData.docs[3].id;
  restaurantId5 = snapshotData.docs[4].id;
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

describe("Testing getRestaurantByUser", () => {
  it("invalid userId", async () => {
    const res = await request(app).get("/api/restaurant/restaurantByUser");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("valid userId", async () => {
    const authRes = await authenticateUser(initialData, app);
    userId = authRes.uid;
    restaurantData[0].ownerId = userId;
    const res = await request(app).get(
      `/api/restaurant/restaurantByUser?userId=${userId}`
    );
    expect(res.statusCode).toBe(200);
    expect(restaurantData[0].ownerId).toEqual(userId);
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

describe("Testing updating restaurant visits", () => {
  it("Can update restaurant visits (first time)", async () => {
    const res = await request(app).get(`/api/restaurant/${restaurantId}/visit`);
    expect(res.statusCode).toBe(200);
  });

  it("Can update restaurant visits (second time)", async () => {
    const res = await request(app).get(`/api/restaurant/${restaurantId}/visit`);
    expect(res.statusCode).toBe(200);
  });
});

describe("Testing getting restaurant visits", () => {
  it("Can get restaurant visits", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/visits`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.totalVisits).toBeGreaterThan(0);
  });

  it("Can't get restaurant visits", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId2}/visits`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.totalVisits).toBe(0);
  });
});

describe("Testing getting restaurant visits by date", () => {
  it("Can get restaurant visits by date", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/visitsByDate?date=${
        new Date().toISOString().split("T")[0]
      }`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBeGreaterThan(0);
  });

  it("Can't get restaurant visits by date (another restaurant)", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId3}/visitsByDate?date=${
        new Date().toISOString().split("T")[0]
      }`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBe(0);
  });
  it("Can't get restaurant visits by date (previos date than today)", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/visitsByDate?date=2021-10-10`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBe(0);
  });
});

describe("Testing getting restaurant visits by range", () => {
  it("Can get restaurant visits by range (7 days)", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/visitsByRange?days=7`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBeGreaterThan(0);
  });

  it("Can get restaurant visits by range (30 days)", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/visitsByRange?days=30`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBeGreaterThan(0);
  });

  it("Can't get restaurant visits by range (another restaurant)", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId4}/visitsByRange?days=7`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.visits).toBe(0);
  });
});

describe("Testing getting restaurant opinions", () => {
  it("Can get restaurant opinions", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/opinions`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("Testing restaurant count", () => {
  it("Can update restaurantCount", async () => {
    const res = await request(app).put(
      `/api/restaurant/${restaurantId}/updateCount`
    );
    expect(res.statusCode).toBe(200);
  });
  it("Can't update restaurantCount (another restaurant)", async () => {
    const authRes = await authenticateUser(initialData2, app);
    userId2 = authRes.uid;
    restaurantData[4].ownerId = userId2;
    const res = await request(app).put(
      `/api/restaurant/${restaurantId5}/updateCount`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({});
  });
});

describe("Testing getRestaurantCount", () => {
  it("Can get restaurantCount", async () => {
    const res = await request(app).get(
      `/api/restaurant/${restaurantId}/getCount`
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
  });
});

describe("Tetsing getRestaurantsWithoutOwner", () => {
  it("Can get restaurants without owner", async () => {
    const res = await request(app).get(
      "/api/restaurants/restaurantsWithoutOwner"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
