import request from "supertest";

// local imports
import {
  menuData1,
  menuSectionData1,
  menuDishData1,
} from "./testCasesMenuData";
import app from "../../app";

export async function createInitialMenu(url, ownerToken, restaurantId) {
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

  const sectionId = res2.body.message
    .split("Section with id ")[1]
    .split(" created successfully")[0];

  return { menuId, sectionId };
}

export async function createInitialMenuDish(url, ownerToken, restaurantId) {
  const { menuId, sectionId } = await createInitialMenu(
    url,
    ownerToken,
    restaurantId
  );

  const res3 = await request(app)
    .post(`/api/${restaurantId}/${menuId}/${sectionId}/createDish`)
    .set("Authorization", ownerToken)
    .send(menuDishData1);

  const dishId = res3.body.message
    .split("Dish with id ")[1]
    .split(" created successfully")[0];

  return { menuId, sectionId, res3, dishId };
}
