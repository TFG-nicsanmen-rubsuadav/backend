import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getCitiesFromRestaurants } from "../utils/utils.js";

export const updateRestaurantVisits = async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  const today = new Date().toISOString().split("T")[0];
  let metrics;
  if (restaurant.data().metrics === undefined) {
    metrics = [{ date: today, visits: 1 }];
    await updateDoc(restaurant.ref, { metrics: metrics });
  } else {
    metrics = restaurant.data().metrics;
    const todayMetrics = metrics.find((metric) => metric.date === today);
    if (!todayMetrics) {
      metrics.push({ date: today, visits: 1 });
    } else {
      todayMetrics.visits++;
    }
    await updateDoc(restaurant.ref, { metrics: metrics });
  }
  return res.status(200).json({ message: "Visits updated" });
};

export const getRestaurantVisits = async (req, res) => {
  const { restaurantId } = req.params;
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  const metrics = restaurant.data().metrics;
  if (!metrics) {
    return res.status(200).json({ totalVisits: 0 });
  }
  const totalVisits = metrics.reduce((acc, metric) => acc + metric.visits, 0);
  return res.status(200).json({ totalVisits });
};

export const getRestaurantVisitsByDate = async (req, res) => {
  const { restaurantId } = req.params;
  const { date } = req.query;
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  const metrics = restaurant.data().metrics;
  if (!metrics) {
    return res.status(200).json({ visits: 0 });
  }
  const dateMetrics = metrics.find((metric) => metric.date === date);
  if (!dateMetrics) {
    return res.status(200).json({ visits: 0 });
  }
  return res.status(200).json({ visits: dateMetrics.visits });
};

export const getRestaurantVisitsByRange = async (req, res) => {
  const { restaurantId } = req.params;
  const { days } = req.query;
  // in days we will get the visits of the last 7 and 30 days (7, 30)
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  const metrics = restaurant.data().metrics;
  if (!metrics) {
    return res.status(200).json({ visits: 0 });
  }
  const today = new Date();
  const todayISO = today.toISOString().split("T")[0];
  const todayTimestamp = today.getTime();
  const daysTimestamp = todayTimestamp - days * 24 * 60 * 60 * 1000;
  const daysAgo = new Date(daysTimestamp);
  const daysAgoISO = daysAgo.toISOString().split("T")[0];
  const rangeMetrics = metrics.filter(
    (metric) => metric.date >= daysAgoISO && metric.date <= todayISO
  );
  const totalVisits = rangeMetrics.reduce(
    (acc, metric) => acc + metric.visits,
    0
  );
  return res.status(200).json({ visits: totalVisits });
};

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

export const getRestaurantOpinions = async (req, res) => {
  const { restaurantId } = req.params;
  const { l } = req.query;
  const restaurant = await getDoc(
    doc(FIREBASE_DB, "restaurants", restaurantId)
  );
  let opinionsQuery = query(
    collection(restaurant.ref, "opinions"),
    orderBy("rating", "desc"),
    limit(l ? Number(l) : 5)
  );
  const opinionsSnapshot = await getDocs(opinionsQuery);
  const opinions = [];
  opinionsSnapshot.forEach((opinion) => {
    opinions.push({ ...opinion.data(), id: opinion.id });
  });
  return res.status(200).json(opinions);
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

export const getRestaurantByUser = async (req, res) => {
  const { userId } = req.query;
  const restaurants = await getDocs(collection(FIREBASE_DB, "restaurants"));
  const restaurantsArray = [];
  restaurants.forEach((restaurant) => {
    if (restaurant.data().ownerId === userId) {
      restaurantsArray.push({ ...restaurant.data(), id: restaurant.id });
    }
  });
  return res.status(200).json(restaurantsArray);
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
