import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import { authenticateUser } from "../../auth/test/utils.js";
import mainUser, { initialData2 } from "./usersTestsCases.js";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { menuData1 } from "./testCasesMenuData.js";

let ownerToken;
let customerToken;
let restaurantId;
let url;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
  const adminAuth = await authenticateUser(mainUser, app);
  ownerToken = adminAuth.idToken;

  const customerAuth = await authenticateUser(initialData2, app);
  customerToken = customerAuth.idToken;
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
  url = `/api/${restaurantId}/createMenu`;
}, 20000);

describe("Controlling menu endpoints with owner/admin middleware throwing invalids tokens", () => {
  it("no token provider", async () => {
    const res = await request(app).post(url).send(menuData1);
    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toEqual("No token provided");
  });

  it("invalid token", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", "invalidToken")
      .send(menuData1);
    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toEqual("Invalid token");
  });

  it("not admin/owner", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", customerToken)
      .send(menuData1);
    expect(res.statusCode).toEqual(403);
    expect(res.body.error).toEqual("Not an admin or owner");
  });
});

describe("Showing the corresponding restaurant menus with owner/admin middleware", () => {
  it("showing the corresponding restaurant menus", async () => {
    const res = await request(app)
      .get(`/api/${restaurantId}/showMenus`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(200);
  });
  it("restaurant not found", async () => {
    const res = await request(app)
      .get("/api/invalidId/showMenus")
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Restaurant not found");
  });
});

describe("Creating a menu with owner/admin middleware", () => {
  it("creating a menu/showing the menu details", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toContain("id");

    // showing the menu details
    const res2 = await request(app)
      .get(`/api/${restaurantId}/showMenus`)
      .set("Authorization", ownerToken);

    const res3 = await request(app).get(
      `/api/${restaurantId}/showMenu/${res2.body[0].id}`
    );
    expect(res3.statusCode).toEqual(200);
  });
  it("creating a menu with missing data (available)", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send({ name: "menu1" });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Invalid menu data");
  });
  it("creating a menu with missing data (name)", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send({ available: true });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Invalid menu data");
  });
  it("restaurant not found", async () => {
    const res = await request(app)
      .post("/api/invalidId/createMenu")
      .set("Authorization", ownerToken)
      .send(menuData1);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Restaurant not found");
  });
});

describe("Updating a menu with owner/admin middleware", () => {
  it("updating a menu", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);

    const menuId = res.body.message
      .split("Menu with id ")[1]
      .split(" created successfully")[0];

    const res2 = await request(app)
      .patch(`/api/${restaurantId}/updateMenu/${menuId}`)
      .set("Authorization", ownerToken)
      .send({ name: "menu2" });
    expect(res2.statusCode).toEqual(200);
    expect(res2.body.message).toEqual("Menu updated successfully");
  });
  it("menu not found", async () => {
    const res = await request(app)
      .patch(`/api/${restaurantId}/updateMenu/invalidId`)
      .set("Authorization", ownerToken)
      .send({ name: "menu2" });
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Menu not found");
  });
  it("restaurant not found", async () => {
    const res = await request(app)
      .patch("/api/invalidId/updateMenu/invalidId")
      .set("Authorization", ownerToken)
      .send({ name: "menu2" });
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Restaurant not found");
  });
});

describe("Showing invalid ids", () => {
  it("invalid restaurantId", async () => {
    const res = await request(app)
      .get("/api/invalidId/showMenu/invalidId")
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Restaurant not found");
  });
  it("invalid menuId", async () => {
    const res = await request(app)
      .get(`/api/${restaurantId}/showMenu/invalidId`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Menu not found");
  });
});

describe("Deleting a menu with owner/admin middleware", () => {
  it("deleting a menu", async () => {
    const res = await request(app)
      .post(url)
      .set("Authorization", ownerToken)
      .send(menuData1);

    const menuId = res.body.message
      .split("Menu with id ")[1]
      .split(" created successfully")[0];

    const res2 = await request(app)
      .delete(`/api/${restaurantId}/deleteMenu/${menuId}`)
      .set("Authorization", ownerToken);
    expect(res2.statusCode).toEqual(204);
  });
  it("menu not found", async () => {
    const res = await request(app)
      .delete(`/api/${restaurantId}/deleteMenu/invalidId`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Menu not found");
  });
  it("restaurant not found", async () => {
    const res = await request(app)
      .delete("/api/invalidId/deleteMenu/invalidId")
      .set("Authorization", ownerToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Restaurant not found");
  });
});
