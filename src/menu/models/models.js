import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

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
