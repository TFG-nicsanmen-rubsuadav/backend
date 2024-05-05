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
  price,
  available
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
    price,
    available,
  });
}
