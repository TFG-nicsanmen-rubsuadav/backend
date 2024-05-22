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

export const searchRestaurant = async (req, res) => {
  const { name, city } = req.query;
  if (!name || !city) {
    return res.status(400).json({ message: "Missing query parameters" });
  }

  const restaurants = await getDocs(collection(FIREBASE_DB, "restaurants"));

  const restaurantsArray = restaurants.docs.reduce((acc, restaurant) => {
    const restaurantData = restaurant.data();
    const restaurantCity = restaurantData.fullAddress
      .split(", ")
      .pop()
      .toLowerCase();

    if (
      restaurantData.restaurantName
        .toLowerCase()
        .includes(name.toLowerCase()) &&
      restaurantCity.includes(city.toLowerCase())
    ) {
      acc.push({ ...restaurantData, id: restaurant.id });
    }

    return acc;
  }, []);

  restaurantsArray.sort((a, b) =>
    a.ownerId && !b.ownerId ? -1 : !a.ownerId && b.ownerId ? 1 : 0
  );

  return res.status(200).json(restaurantsArray);
};
