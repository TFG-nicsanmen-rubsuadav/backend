import { Router } from "express";

//local imports
import {
  getRestaurantById,
  getRestaurants,
  searchRestaurant,
} from "../controllers/restaurant.controller.js";

const router = Router();

router.get("/restaurants", getRestaurants);
router.get("/restaurant/search", searchRestaurant);
router.get("/restaurant/:restaurantId", getRestaurantById);

export default router;
