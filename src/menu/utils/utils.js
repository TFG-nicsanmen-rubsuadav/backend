import { collection, getDocs, getDoc, doc } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export const allergensList = [
  "gluten",
  "crustáceos",
  "huevos",
  "pescado",
  "cacahuetes",
  "soja",
  "lácteos",
  "frutos de cáscara",
  "apio",
  "mostaza",
  "granos de sésamo",
  "dióxido de azufre y sulfitos",
  "altramuces",
  "moluscos"
];

// MENU METHODS //
export async function getRestaurantMenu(restaurantId) {
  const menuSnapshot = await getDocs(
    collection(FIREBASE_DB, "restaurants", restaurantId, "menu")
  );
  return menuSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getMenuById(restaurantId, menuId) {
  const menuSnapshot = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId, "menu", menuId)
  );
  return menuSnapshot.data();
}

// MENU SECTION  METHODS //
export async function getRestaurantMenuSection(restaurantId, menuId) {
  const sectionSnapshot = await getDocs(
    collection(
      FIREBASE_DB,
      "restaurants",
      restaurantId,
      "menu",
      menuId,
      "section"
    )
  );
  return sectionSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getMenuSectionById(restaurantId, menuId, sectionId) {
  const sectionSnapshot = await getDoc(
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
  return sectionSnapshot.data();
}

// MENU DISH METHODS //
export async function getRestaurantMenuDish(restaurantId, menuId, sectionId) {
  const dishSnapshot = await getDocs(
    collection(
      FIREBASE_DB,
      "restaurants",
      restaurantId,
      "menu",
      menuId,
      "section",
      sectionId,
      "dish"
    )
  );
  return dishSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

export async function getMenuDishById(restaurantId, menuId, sectionId, dishId) {
  const dishSnapshot = await getDoc(
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
  return dishSnapshot.data();
}
