import { collection, addDoc } from "firebase/firestore";

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
