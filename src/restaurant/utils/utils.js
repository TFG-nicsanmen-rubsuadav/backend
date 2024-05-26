import { collection, getDocs } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export const getCitiesFromRestaurants = async () => {
  const restaurants = await getDocs(collection(FIREBASE_DB, "restaurants"));
  const cities = new Set();
  restaurants.forEach((restaurant) => {
    const restaurantCity = restaurant
      .data()
      .fullAddress.split(", ")
      .pop()
      .toLowerCase();
    cities.add(
      restaurantCity.charAt(0).toUpperCase() + restaurantCity.slice(1)
    );
  });
  return cities;
};
