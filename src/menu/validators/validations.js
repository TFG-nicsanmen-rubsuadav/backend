import { getDoc, doc } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export function validateMenuData(name, available, isCreate) {
  if (isCreate) {
    if (
      name === undefined ||
      available === undefined ||
      name === "" ||
      available === "" ||
      typeof available !== "boolean"
    ) {
      return false;
    }
    return true;
  } else {
    if (
      name === undefined &&
      available === undefined &&
      name === "" &&
      available === "" &&
      typeof available !== "boolean"
    ) {
      return false;
    }
    return true;
  }
}

export async function validateRestaurantId(id) {
  if (!id) {
    return false;
  } else {
    const restaurant = await getDoc(doc(FIREBASE_DB, "restaurants", id));
    if (!restaurant.exists()) {
      return false;
    }
  }
  return true;
}

export async function validateMenuId(restaurantId, menuId) {
  if (!restaurantId || !menuId) {
    return false;
  } else {
    const restaurant = await getDoc(
      doc(FIREBASE_DB, "restaurants", restaurantId, "menu", menuId)
    );
    if (!restaurant.exists()) {
      return false;
    }
  }
  return true;
}

export async function validateSectionId(restaurantId, menuId, sectionId) {
  if (!restaurantId || !menuId || !sectionId) {
    return false;
  } else {
    const section = await getDoc(
      doc(
        FIREBASE_DB,
        "restaurants",
        restaurantId,
        "menu",
        menuId,
        "section",
        sectionId
      )
    );
    if (!section.exists()) {
      return false;
    }
  }
  return true;
}

export async function validateDishId(restaurantId, menuId, sectionId, dishId) {
  if (!restaurantId || !menuId || !sectionId || !dishId) {
    return false;
  } else {
    const dish = await getDoc(
      doc(
        FIREBASE_DB,
        "restaurants",
        restaurantId,
        "menu",
        menuId,
        "section",
        sectionId,
        "dish",
        dishId
      )
    );
    if (!dish.exists()) {
      return false;
    }
  }
  return true;
}
