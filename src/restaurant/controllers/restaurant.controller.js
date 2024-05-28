import { collection, doc, getDoc, getDocs } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getCitiesFromRestaurants } from "../utils/utils.js";

export const getNumberOfRestaurants = async (req, res) => {
  const restaurants = await getDocs(collection(FIREBASE_DB, "restaurants"));
  return res.status(200).json({ numberOfRestaurants: restaurants.size });
};

export const getNumberOfCities = async (req, res) => {
  const cities = await getCitiesFromRestaurants();
  return res.status(200).json({ numberOfCities: cities.size });
};

export const getAllCities = async (req, res) => {
  const cities = await getCitiesFromRestaurants();
  return res.status(200).json({ cities: Array.from(cities) });
};

export const getNumberOfOpinions = async (req, res) => {
  const restaurantsSnapshot = await getDocs(
    collection(FIREBASE_DB, "restaurants")
  );
  let totalOpinions = 0;
  for (const restaurantDoc of restaurantsSnapshot.docs) {
    const opinionsSnapshot = await getDocs(
      collection(restaurantDoc.ref, "opinions")
    );
    totalOpinions += opinionsSnapshot.size;
  }
  return res.status(200).json({ numberOfOpinions: totalOpinions });
};

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
