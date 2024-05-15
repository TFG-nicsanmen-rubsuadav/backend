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
  creteMenuSectionDish,
  showDishById,
  showMenuSectionDishes,
  updateDish,
  deleteDish,
  getFullMenuById,
} from "../controllers/menu.controller.js";

const router = Router();

// MENU ROUTES //
router.post("/:restaurantId/createMenu", checkOwner, createMenu);
router.get("/:restaurantId/showMenus", showRestaurantMenu);
router.get("/:restaurantId/showMenu/:menuId", showMenuById);
router.patch("/:restaurantId/updateMenu/:menuId", checkOwner, updateMenu);
router.delete("/:restaurantId/deleteMenu/:menuId", checkOwner, deleteMenu);
router.get("/:restaurantId/:menuId/fullMenu", getFullMenuById);

// SECTION ROUTES //
router.post(
  "/:restaurantId/:menuId/createSection",
  checkOwner,
  createMenuSection
);
router.get("/:restaurantId/:menuId/showSections", showMenuSection);
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

// DISH ROUTES //
router.post(
  "/:restaurantId/:menuId/:sectionId/createDish",
  checkOwner,
  creteMenuSectionDish
);
router.get(
  "/:restaurantId/:menuId/:sectionId/showDishes",
  showMenuSectionDishes
);
router.get("/:restaurantId/:menuId/:sectionId/showDish/:dishId", showDishById);
router.patch(
  "/:restaurantId/:menuId/:sectionId/updateDish/:dishId",
  checkOwner,
  updateDish
);
router.delete(
  "/:restaurantId/:menuId/:sectionId/deleteDish/:dishId",
  checkOwner,
  deleteDish
);

export default router;
