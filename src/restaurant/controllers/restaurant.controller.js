import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export const getRestaurants = async (req, res) => {
  const restaurants = await getDocs(collection(FIREBASE_DB, "restaurants"));
  const restaurantsArray = [];
  restaurants.forEach((restaurant) => {
    restaurantsArray.push({ ...restaurant.data(), id: restaurant.id });
  });
  return res.status(200).json(restaurantsArray);
};

export const getRestaurantById = async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  if (!restaurant.exists()) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  return res.status(200).json({ ...restaurant.data(), id: restaurant.id });
};
