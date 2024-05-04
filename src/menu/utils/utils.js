import { collection, getDocs } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export async function getRestaurantMenu(restaurantId) {
  const menuSnapshot = await getDocs(
    collection(FIREBASE_DB, "restaurants", restaurantId, "menu")
  );
  return menuSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}
