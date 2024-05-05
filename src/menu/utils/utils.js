import { collection, getDocs, getDoc, doc } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

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
