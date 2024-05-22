import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import { generatePhoneNumber } from "./utils.js";
import testCases from "./testNegativeCases.js";
import initialData from "./initialCreation.js";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";

let restaurantId;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
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

  it("should create a new user with role owner and return a token", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Owner27732",
      lastName: "Test",
      email: "ownermullertest@gmail.com",
      password: "@Password1234",
      phone: generatePhoneNumber(),
      birthDate: "10/07/1998",
      rol: "owner",
      restId: restaurantId,
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("sessionId");
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
