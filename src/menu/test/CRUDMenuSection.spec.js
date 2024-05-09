import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import { authenticateUser } from "../../auth/test/utils.js";
import { initialData3 } from "./usersTestsCases.js";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { menuData1, menuSectionData1 } from "./testCasesMenuData.js";
import { createInitialMenu } from "./utils.js";

let ownerToken;
let restaurantId;
let url;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
  const adminAuth = await authenticateUser(initialData3, app);
  ownerToken = adminAuth.idToken;
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
  url = `/api/${restaurantId}/createMenu`;
}, 20000);

describe("Creating a menu section with owner/admin middleware", () => {
  it("creating a menu/showing the menu section details", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);

    const menuId = res.body.message
      .split("Menu with id ")[1]
      .split(" created successfully")[0];

    const res2 = await request(app)
      .post(`/api/${restaurantId}/${menuId}/createSection`)
      .set("Authorization", ownerToken)
      .send(menuSectionData1);

    const responseMessage = res2.body.message;

    expect(res2.statusCode).toBe(201);
    expect(responseMessage).toContain("id");

    // showing the menu section details

    const sectionId = responseMessage
      .split("Section with id ")[1]
      .split(" created successfully")[0];

    const res3 = await request(app).get(
      `/api/${restaurantId}/${menuId}/showSection/${sectionId}`
    );

    expect(res3.statusCode).toBe(200);
  });
  it("creating a menu section with invalid restaurantId", async () => {
    const res = await request(app)
      .post(`/api/invalidId/invalidId/createSection`)
      .set("Authorization", ownerToken)
      .send(menuSectionData1);

    expect(res.statusCode).toBe(404);
  });
  it("creating a menu section with invalid menuId", async () => {
    const res = await request(app)
      .post(`/api/${restaurantId}/invalidId/createSection`)
      .set("Authorization", ownerToken)
      .send(menuSectionData1);

    expect(res.statusCode).toBe(404);
  });
  it("not create a menu section cause bad data", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);

    const menuId = res.body.message
      .split("Menu with id ")[1]
      .split(" created successfully")[0];

    const res2 = await request(app)
      .post(`/api/${restaurantId}/${menuId}/createSection`)
      .set("Authorization", ownerToken)
      .send({});

    expect(res2.statusCode).toBe(400);
  });
});

describe("Testing showing all the menu sections available", () => {
  it("showing all the menu sections", async () => {
    const { menuId } = await createInitialMenu(url, ownerToken, restaurantId);

    const res = await request(app)
      .get(`/api/${restaurantId}/${menuId}/showSections`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(200);
  });
  it("showing all the menu sections with invalid restaurantId", async () => {
    const res = await request(app)
      .get(`/api/invalidId/invalidId/showSections`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(404);
  });
  it("showing all the menu sections with invalid menuId", async () => {
    const res = await request(app)
      .get(`/api/${restaurantId}/invalidId/showSections`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(404);
  });
});

describe("Testing trying to show menu section details", () => {
  it("invalid restaurantId", async () => {
    const res = await request(app)
      .get(`/api/invalidId/invalidId/showSection/invalidId`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
  });
  it("invalid menuId", async () => {
    const res = await request(app).get(
      `/api/${restaurantId}/invalidId/showSection/invalidId`
    );
    expect(res.statusCode).toBe(404);
  });
  it("invalid sectionId", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);

    const menuId = res.body.message
      .split("Menu with id ")[1]
      .split(" created successfully")[0];

    const res2 = await request(app).get(
      `/api/${restaurantId}/${menuId}/showSection/invalidId`
    );
    expect(res2.statusCode).toBe(404);
  });
});

describe("Testing updating a menu section", () => {
  it("updating a menu section", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res3 = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/updateSection/${sectionId}`)
      .set("Authorization", ownerToken)
      .send({ name: "newName" });

    expect(res3.statusCode).toBe(200);
  });
  it("updating a menu section with invalid restaurantId", async () => {
    const res = await request(app)
      .patch(`/api/invalidId/invalidId/updateSection/invalidId`)
      .set("Authorization", ownerToken)
      .send({ name: "newName" });

    expect(res.statusCode).toBe(404);
  });
  it("updating a menu section with invalid menuId", async () => {
    const res = await request(app)
      .patch(`/api/${restaurantId}/invalidId/updateSection/invalidId`)
      .set("Authorization", ownerToken)
      .send({ name: "newName" });

    expect(res.statusCode).toBe(404);
  });
  it("updating a menu section with invalid sectionId", async () => {
    const { menuId } = await createInitialMenu(url, ownerToken, restaurantId);
    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/updateSection/invalidId`)
      .set("Authorization", ownerToken)
      .send({ name: "newName" });

    expect(res.statusCode).toBe(404);
  });
});

describe("Testing deleting a menu section", () => {
  it("deleting a menu section", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res3 = await request(app)
      .delete(`/api/${restaurantId}/${menuId}/deleteSection/${sectionId}`)
      .set("Authorization", ownerToken);

    expect(res3.statusCode).toBe(204);
  });
  it("deleting a menu section with invalid restaurantId", async () => {
    const res = await request(app)
      .delete(`/api/invalidId/invalidId/deleteSection/invalidId`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(404);
  });
  it("deleting a menu section with invalid menuId", async () => {
    const res = await request(app)
      .delete(`/api/${restaurantId}/invalidId/deleteSection/invalidId`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(404);
  });
  it("deleting a menu section with invalid sectionId", async () => {
    const { menuId } = await createInitialMenu(url, ownerToken, restaurantId);
    const res = await request(app)
      .delete(`/api/${restaurantId}/${menuId}/deleteSection/invalidId`)
      .set("Authorization", ownerToken);

    expect(res.statusCode).toBe(404);
  });
});
