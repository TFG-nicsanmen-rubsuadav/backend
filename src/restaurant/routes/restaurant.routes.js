import { Router } from "express";

//local imports
import { getRestaurantById } from "../controllers/restaurant.controller.js";

const router = Router();

router.get("/restaurant/:restaurantId", getRestaurantById);

export default router;
