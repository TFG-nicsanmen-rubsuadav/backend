import { Router } from "express";

//local imports
import {
  getAllCities,
  getNumberOfCities,
  getNumberOfOpinions,
  getNumberOfRestaurants,
  getRestaurantById,
  getRestaurantByUser,
  getRestaurantVisits,
  getRestaurantVisitsByDate,
  getRestaurantVisitsByRange,
  getRestaurants,
  searchRestaurant,
  updateRestaurantVisits,
} from "../controllers/restaurant.controller.js";

const router = Router();

router.get("/restaurants", getRestaurants);
router.get("/restaurants/count", getNumberOfRestaurants);
router.get("/restaurants/numberOfCities", getNumberOfCities);
router.get("/restaurants/cities", getAllCities);
router.get("/restaurants/numberOfOpinions", getNumberOfOpinions);
router.get("/restaurant/search", searchRestaurant);
router.get("/restaurant/restaurantByUser", getRestaurantByUser);
router.get("/restaurant/:restaurantId", getRestaurantById);
router.get("/restaurant/:restaurantId/visit", updateRestaurantVisits);
router.get("/restaurant/:restaurantId/visits", getRestaurantVisits);
router.get("/restaurant/:restaurantId/visitsByDate", getRestaurantVisitsByDate);
router.get(
  "/restaurant/:restaurantId/visitsByRange",
  getRestaurantVisitsByRange
);

export default router;
