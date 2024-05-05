import { Router } from "express";

//local imports
import { checkOwner } from "../middlewares/checkRoleOwner.js";
import {
  createMenu,
  showRestaurantMenu,
  showMenuById,
  updateMenu,
  deleteMenu,
} from "../controllers/menu.controller.js";

const router = Router();

router.post("/:restaurantId/createMenu", checkOwner, createMenu);
router.get("/:restaurantId/showMenus", checkOwner, showRestaurantMenu);
router.get("/:restaurantId/showMenu/:menuId", showMenuById);
router.patch("/:restaurantId/updateMenu/:menuId", checkOwner, updateMenu);
router.delete("/:restaurantId/deleteMenu/:menuId", checkOwner, deleteMenu);

export default router;
