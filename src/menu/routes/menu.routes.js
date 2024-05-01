import { Router } from "express";

//local imports
import { checkOwner } from "../middlewares/checkRoleOwner.js";
import { createMenu } from "../controllers/menu.controller.js";

const router = Router();

router.post("/:restaurantId/createMenu", checkOwner, createMenu);

export default router;
