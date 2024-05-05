import {
  createRestaurantMenu,
  updateRestaurantMenu,
  deleteRestaurantMenu,
} from "../models/models.js";
import { getRestaurantMenu, getMenuById } from "../utils/utils.js";
import {
  validateMenuData,
  validateRestaurantId,
  validateMenuId,
} from "../validators/validations.js";

export const showMenuById = async (req, res) => {
  const { restaurantId, menuId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  const menu = await getMenuById(restaurantId, menuId);
  return res.status(200).json(menu);
};

export const showRestaurantMenu = async (req, res) => {
  const { restaurantId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  const menu = await getRestaurantMenu(restaurantId);
  return res.status(200).json(menu);
};

export const createMenu = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!validateMenuData(name, available, true)) {
    return res.status(400).json({ message: "Invalid menu data" });
  }

  await createRestaurantMenu(restaurantId, name, description, available);
  for (let menu of await getRestaurantMenu(restaurantId)) {
    if (menu.name === name) {
      return res.status(201).json({
        message: `Menu with id ${menu.id} created successfully`,
      });
    }
  }
};

export const updateMenu = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId, menuId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!validateMenuData(name, available, false)) {
    return res.status(400).json({ message: "Invalid menu data" });
  }

  await updateRestaurantMenu(
    restaurantId,
    menuId,
    name,
    description,
    available
  );
  return res.status(200).json({ message: "Menu updated successfully" });
};

export const deleteMenu = async (req, res) => {
  const { restaurantId, menuId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Invalid restaurant id" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Invalid menu id" });
  }

  await deleteRestaurantMenu(restaurantId, menuId);
  return res.status(204).json({ message: "Menu deleted successfully" });
};
