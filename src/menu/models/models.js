import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

// MENU METHODS //
export async function createRestaurantMenu(
  restaurantId,
  name,
  description,
  available
) {
  const menuCollection = collection(
    FIREBASE_DB,
    "restaurants",
    restaurantId,
    "menu"
  );
  await addDoc(menuCollection, {
    name,
    description,
    available,
    createdAt: new Date(),
  });
}

export async function updateRestaurantMenu(
  restaurantId,
  menuId,
  name,
  description,
  available
) {
  let updateObject = {};
  if (name !== undefined) updateObject.name = name;
  if (description !== undefined) updateObject.description = description;
  if (available !== undefined) updateObject.available = available;

  await updateDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId, "menu", menuId),
    updateObject
  );
}

export async function deleteRestaurantMenu(restaurantId, menuId) {
  await deleteDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId, "menu", menuId)
  );
}

// MENU SECTION  METHODS //
export async function createRestaurantMenuSection(
  restaurantId,
  menuId,
  name,
  description,
  available
) {
  const sectionCollection = collection(
    FIREBASE_DB,
    "restaurants",
    restaurantId,
    "menu",
    menuId,
    "section"
  );
  await addDoc(sectionCollection, {
    name,
    description,
    available,
    createdAt: new Date(),
  });
}

export async function updateRestaurantMenuSection(
  restaurantId,
  menuId,
  sectionId,
  name,
  description,
  available
) {
  let updateObject = {};
  if (name !== undefined) updateObject.name = name;
  if (description !== undefined) updateObject.description = description;
  if (available !== undefined) updateObject.available = available;

  await updateDoc(
    doc(
      FIREBASE_DB,
      "restaurants",
      restaurantId,
      "menu",
      menuId,
      "section",
      sectionId
    ),
    updateObject
  );
}

export async function deleteRestaurantMenuSection(
  restaurantId,
  menuId,
  sectionId
) {
  await deleteDoc(
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
}

// DISH METHODS //
export async function createRestaurantMenuSectionDish(
  restaurantId,
  menuId,
  sectionId,
  name,
  description,
  rations,
  available,
  allergens
) {
  const dishCollection = collection(
    FIREBASE_DB,
    "restaurants",
    restaurantId,
    "menu",
    menuId,
    "section",
    sectionId,
    "dish"
  );
  await addDoc(dishCollection, {
    name,
    description,
    rations,
    available,
    allergens,
    createdAt: new Date(),
  });
}

export async function updateRestaurantMenuSectionDish(
  restaurantId,
  menuId,
  sectionId,
  dishId,
  name,
  description,
  rations,
  available,
  allergens
) {
  let updateObject = {};
  if (name !== undefined) updateObject.name = name;
  if (description !== undefined) updateObject.description = description;
  if (rations !== undefined) updateObject.rations = rations;
  if (available !== undefined) updateObject.available = available;
  if (allergens !== undefined) updateObject.allergens = allergens;

  await updateDoc(
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
    ),
    updateObject
  );
}

export async function deleteRestaurantMenuSectionDish(
  restaurantId,
  menuId,
  sectionId,
  dishId
) {
  await deleteDoc(
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
}
