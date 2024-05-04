import { getDoc, doc } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export function validateMenuData(name, available) {
  if (!name || !available) {
    return false;
  }
  return true;
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
