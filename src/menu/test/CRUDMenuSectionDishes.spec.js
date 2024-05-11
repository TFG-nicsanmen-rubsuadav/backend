import request from "supertest";
import { collection, getDocs } from "firebase/firestore";

// local imports
import app, { saveDataToFirebase } from "../../app";
import { authenticateUser } from "../../auth/test/utils.js";
import { initialData4 } from "./usersTestsCases.js";
import restaurantData from "../../SR/test/initialRestaurantData.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { createInitialMenuDish, createInitialMenu } from "./utils.js";
import { invalidDishData, invalidDishData2 } from "./invalidDishData.js";
import { menuDishData2 } from "./testCasesMenuData.js";

let ownerToken;
let restaurantId;
let url;

beforeAll(async () => {
  await saveDataToFirebase(restaurantData);
  const adminAuth = await authenticateUser(initialData4, app);
  ownerToken = adminAuth.idToken;
}, 20000);

beforeEach(async () => {
  const snapshotData = await getDocs(collection(FIREBASE_DB, "restaurants"));
  restaurantId = snapshotData.docs[0].id;
  url = `/api/${restaurantId}/createMenu`;
}, 20000);

describe("Creating a menu dish with owner/admin middleware", () => {
  it("creating a menu/showing the menu dish details", async () => {
    const { menuId, sectionId, res3, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );
    expect(res3.statusCode).toBe(201);

    // show dish details
    const res = await request(app).get(
      `/api/${restaurantId}/${menuId}/${sectionId}/showDish/${dishId}`
    );
    expect(res.statusCode).toBe(200);
  });

  it("creating a menu dish with invalid data", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .post(`/api/${restaurantId}/${menuId}/${sectionId}/createDish`)
      .set("Authorization", ownerToken)
      .send({ name: "dish1" });
    expect(res.statusCode).toBe(400);
  });

  it("creating a menu dish wih invalid data (allergen not in list)", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .post(`/api/${restaurantId}/${menuId}/${sectionId}/createDish`)
      .set("Authorization", ownerToken)
      .send(invalidDishData);
    expect(res.statusCode).toBe(400);
  });

  it("creating a menu dish with invalid data (allergen not a list)", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .post(`/api/${restaurantId}/${menuId}/${sectionId}/createDish`)
      .set("Authorization", ownerToken)
      .send(invalidDishData2);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Allergens must be an array",
    });
  });

  it("trying to create a menu dish with invalid restaurantId", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .post(`/api/invalidId/${menuId}/${sectionId}/createDish`)
      .set("Authorization", ownerToken)
      .send({ name: "dish1" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Restaurant not found",
    });
  });

  it("trying to create a menu dish with invalid menuId", async () => {
    await createInitialMenu(url, ownerToken, restaurantId);

    const res = await request(app)
      .post(`/api/${restaurantId}/invalidId/sectionId/createDish`)
      .set("Authorization", ownerToken)
      .send({ name: "dish1" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Menu not found",
    });
  });

  it("trying to create a menu dish with invalid sectionId", async () => {
    const { menuId } = await createInitialMenu(url, ownerToken, restaurantId);

    const res = await request(app)
      .post(`/api/${restaurantId}/${menuId}/invalidId/createDish`)
      .set("Authorization", ownerToken)
      .send({ name: "dish1" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Section not found",
    });
  });
});

describe("Testing showing all dishes in a section", () => {
  it("showing all dishes in a section", async () => {
    const { menuId, sectionId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .get(`/api/${restaurantId}/${menuId}/${sectionId}/showDishes`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(200);
  });

  it("trying to show all dishes in a section with invalid restaurantId", async () => {
    const { menuId, sectionId } = await createInitialMenu(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .get(`/api/invalidId/${menuId}/${sectionId}/showDishes`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Restaurant not found",
    });
  });

  it("trying to show all dishes in a section with invalid menuId", async () => {
    const res = await request(app)
      .get(`/api/${restaurantId}/invalidId/sectionId/showDishes`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Menu not found",
    });
  });

  it("trying to show all dishes in a section with invalid sectionId", async () => {
    const { menuId } = await createInitialMenu(url, ownerToken, restaurantId);

    const res = await request(app)
      .get(`/api/${restaurantId}/${menuId}/invalidId/showDishes`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Section not found",
    });
  });
});

describe("Trying to retrieve a dish by id", () => {
  it("retrieving a dish by id", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app).get(
      `/api/${restaurantId}/${menuId}/${sectionId}/showDish/${dishId}`
    );
    expect(res.statusCode).toBe(200);
  });

  it("trying to retrieve a dish by id with invalid restaurantId", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app).get(
      `/api/invalidId/${menuId}/${sectionId}/showDish/${dishId}`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Restaurant not found",
    });
  });

  it("trying to retrieve a dish by id with invalid menuId", async () => {
    const { sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app).get(
      `/api/${restaurantId}/invalidId/${sectionId}/showDish/${dishId}`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Menu not found",
    });
  });

  it("trying to retrieve a dish by id with invalid sectionId", async () => {
    const { menuId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app).get(
      `/api/${restaurantId}/${menuId}/invalidId/showDish/${dishId}`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Section not found",
    });
  });

  it("trying to retrieve a dish by id with invalid dishId", async () => {
    const { menuId, sectionId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app).get(
      `/api/${restaurantId}/${menuId}/${sectionId}/showDish/invalidId`
    );
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Dish not found",
    });
  });
});

describe("Updating a dish", () => {
  it("updating a dish", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send(menuDishData2);
    expect(res.statusCode).toBe(200);
  });

  it("updating a dish with invalid data", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send({ name: "newDish" });
    expect(res.statusCode).toBe(400);
  });

  it("updating a dish with invalid data (type of allergens)", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send(invalidDishData2);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message: "Allergens must be an array",
    });
  });

  it("updating a dish with invalid data (allergen not in list)", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send(invalidDishData);
    expect(res.statusCode).toBe(400);
  });

  it("updating a dish with invalid restaurantId", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/invalidId/${menuId}/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send({ name: "newDish" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Restaurant not found",
    });
  });

  it("updating a dish with invalid menuId", async () => {
    const { sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/invalidId/${sectionId}/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send({ name: "newDish" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Menu not found",
    });
  });

  it("updating a dish with invalid sectionId", async () => {
    const { menuId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/invalidId/updateDish/${dishId}`)
      .set("Authorization", ownerToken)
      .send({ name: "newDish" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Section not found",
    });
  });

  it("updating a dish with invalid dishId", async () => {
    const { menuId, sectionId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .patch(`/api/${restaurantId}/${menuId}/${sectionId}/updateDish/invalidId`)
      .set("Authorization", ownerToken)
      .send({ name: "newDish" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Dish not found",
    });
  });
});

describe("Deleting a dish", () => {
  it("deleting a dish", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .delete(
        `/api/${restaurantId}/${menuId}/${sectionId}/deleteDish/${dishId}`
      )
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(204);
  });

  it("deleting a dish with invalid restaurantId", async () => {
    const { menuId, sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .delete(`/api/invalidId/${menuId}/${sectionId}/deleteDish/${dishId}`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Restaurant not found",
    });
  });

  it("deleting a dish with invalid menuId", async () => {
    const { sectionId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .delete(
        `/api/${restaurantId}/invalidId/${sectionId}/deleteDish/${dishId}`
      )
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Menu not found",
    });
  });

  it("deleting a dish with invalid sectionId", async () => {
    const { menuId, dishId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .delete(`/api/${restaurantId}/${menuId}/invalidId/deleteDish/${dishId}`)
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Section not found",
    });
  });

  it("deleting a dish with invalid dishId", async () => {
    const { menuId, sectionId } = await createInitialMenuDish(
      url,
      ownerToken,
      restaurantId
    );

    const res = await request(app)
      .delete(
        `/api/${restaurantId}/${menuId}/${sectionId}/deleteDish/invalidId`
      )
      .set("Authorization", ownerToken);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: "Dish not found",
    });
  });
});
