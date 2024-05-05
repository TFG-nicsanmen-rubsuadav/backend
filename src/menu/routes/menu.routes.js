import { Router } from "express";

//local imports
import { checkOwner } from "../middlewares/checkRoleOwner.js";
import {
  createMenu,
  showRestaurantMenu,
  showMenuById,
  updateMenu,
  deleteMenu,
  createMenuSection,
  showMenuSection,
  showSectionById,
  updateMenuSection,
  deleteMenuSection,
} from "../controllers/menu.controller.js";

const router = Router();

// MENU ROUTES //
router.post("/:restaurantId/createMenu", checkOwner, createMenu);
router.get("/:restaurantId/showMenus", checkOwner, showRestaurantMenu);
router.get("/:restaurantId/showMenu/:menuId", showMenuById);
router.patch("/:restaurantId/updateMenu/:menuId", checkOwner, updateMenu);
router.delete("/:restaurantId/deleteMenu/:menuId", checkOwner, deleteMenu);

// SECTION ROUTES //
router.post(
  "/:restaurantId/:menuId/createSection",
  checkOwner,
  createMenuSection
);
router.get("/:restaurantId/:menuId/showSections", checkOwner, showMenuSection);
router.get("/:restaurantId/:menuId/showSection/:sectionId", showSectionById);
router.patch(
  "/:restaurantId/:menuId/updateSection/:sectionId",
  checkOwner,
  updateMenuSection
);
router.delete(
  "/:restaurantId/:menuId/deleteSection/:sectionId",
  checkOwner,
  deleteMenuSection
);

export default router;
