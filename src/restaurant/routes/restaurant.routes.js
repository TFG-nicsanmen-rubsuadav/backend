import { Router } from "express";

//local imports
import {
  getRestaurantById,
  getRestaurants,
} from "../controllers/restaurant.controller.js";

const router = Router();

router.get("/restaurants", getRestaurants);
router.get("/restaurant/:restaurantId", getRestaurantById);

export default router;
