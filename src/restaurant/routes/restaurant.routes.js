import { Router } from "express";

//local imports
import {
  getAllCities,
  getNumberOfCities,
  getNumberOfOpinions,
  getNumberOfRestaurants,
  getRestaurantById,
  getRestaurants,
  searchRestaurant,
} from "../controllers/restaurant.controller.js";

const router = Router();

router.get("/restaurants", getRestaurants);
router.get("/restaurants/count", getNumberOfRestaurants);
router.get("/restaurants/numberOfCities", getNumberOfCities);
router.get("/restaurants/cities", getAllCities);
router.get("/restaurants/numberOfOpinions", getNumberOfOpinions);
router.get("/restaurant/search", searchRestaurant);
router.get("/restaurant/:restaurantId", getRestaurantById);

export default router;
