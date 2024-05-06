import {
  createRestaurantMenu,
  updateRestaurantMenu,
  deleteRestaurantMenu,
  createRestaurantMenuSection,
  updateRestaurantMenuSection,
  deleteRestaurantMenuSection,
  createRestaurantMenuSectionDish,
  updateRestaurantMenuSectionDish,
  deleteRestaurantMenuSectionDish,
} from "../models/models.js";
import {
  getRestaurantMenu,
  getMenuById,
  getRestaurantMenuSection,
  getMenuSectionById,
  getRestaurantMenuDish,
  getMenuDishById,
  allergensList,
} from "../utils/utils.js";
import {
  validateMenuData,
  validateRestaurantId,
  validateMenuId,
  validateSectionId,
  validateDishId,
} from "../validators/validations.js";

// CRUD OPERATIONS FOR MENU //
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
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }

  await deleteRestaurantMenu(restaurantId, menuId);
  return res.status(204).json({ message: "Menu deleted successfully" });
};

// CRUD OPERATIONS FOR MENU SECTIONS //
export const showSectionById = async (req, res) => {
  const { restaurantId, menuId, sectionId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  const section = await getMenuSectionById(restaurantId, menuId, sectionId);
  return res.status(200).json(section);
};

export const showMenuSection = async (req, res) => {
  const { restaurantId, menuId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  const sections = await getRestaurantMenuSection(restaurantId, menuId);
  return res.status(200).json(sections);
};

export const createMenuSection = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId, menuId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!validateMenuData(name, available, true)) {
    return res.status(400).json({ message: "Invalid menu's section data" });
  }

  await createRestaurantMenuSection(
    restaurantId,
    menuId,
    name,
    description,
    available
  );
  for (let section of await getRestaurantMenuSection(restaurantId, menuId)) {
    if (section.name === name) {
      return res.status(201).json({
        message: `Section with id ${section.id} created successfully`,
      });
    }
  }
};

export const updateMenuSection = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId, menuId, sectionId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  if (!validateMenuData(name, available, false)) {
    return res.status(400).json({ message: "Invalid menu's section data" });
  }

  await updateRestaurantMenuSection(
    restaurantId,
    menuId,
    sectionId,
    name,
    description,
    available
  );
  return res.status(200).json({ message: "Section updated successfully" });
};

export const deleteMenuSection = async (req, res) => {
  const { restaurantId, menuId, sectionId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }

  await deleteRestaurantMenuSection(restaurantId, menuId, sectionId);
  return res.status(204).json({ message: "Section deleted successfully" });
};

// CRUD OPERATIONS FOR DISHES //
// TODO: Valorar como vamos a gestionar si aquí o en otra query, que al cliente le aparezcan únicamente
// los platos que están disponibles (available: True)
export const showMenuSectionDishes = async (req, res) => {
  const { restaurantId, menuId, sectionId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  const dishes = await getRestaurantMenuDish(restaurantId, menuId, sectionId);
  return res.status(200).json(dishes);
};

export const showDishById = async (req, res) => {
  const { restaurantId, menuId, sectionId, dishId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  if (!(await validateDishId(restaurantId, menuId, sectionId, dishId))) {
    return res.status(404).json({ message: "Dish not found" });
  }
  const dish = await getMenuDishById(restaurantId, menuId, sectionId, dishId);
  return res.status(200).json(dish);
};

export const creteMenuSectionDish = async (req, res) => {
  const { name, description, rations, available, allergens } = req.body;
  const { restaurantId, menuId, sectionId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  if (!validateMenuData(name, available, true)) {
    return res.status(400).json({ message: "Dish not found" });
  }

  if (!Array.isArray(allergens)) {
    return res.status(400).json({ message: "Allergens must be an array" });
  }

  for (let allergen of allergens) {
    if (!allergensList.includes(allergen)) {
      return res.status(400).json({ message: `Invalid allergen: ${allergen}` });
    }
  }

  await createRestaurantMenuSectionDish(
    restaurantId,
    menuId,
    sectionId,
    name,
    description,
    rations,
    available,
    allergens
  );
  for (let dish of await getRestaurantMenuDish(
    restaurantId,
    menuId,
    sectionId
  )) {
    if (dish.name === name) {
      return res.status(201).json({
        message: `Dish with id ${dish.id} created successfully`,
      });
    }
  }
};

export const updateDish = async (req, res) => {
  const { name, description, rations, available, allergens } = req.body;
  const { restaurantId, menuId, sectionId, dishId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  if (!(await validateDishId(restaurantId, menuId, sectionId, dishId))) {
    return res.status(404).json({ message: "Dish not found" });
  }
  if (!validateMenuData(name, available, false)) {
    return res.status(400).json({ message: "Invalid menu's dish data" });
  }
  if (!Array.isArray(allergens)) {
    return res.status(400).json({ message: "Allergens must be an array" });
  }
  for (let allergen of allergens) {
    if (!allergensList.includes(allergen)) {
      return res.status(400).json({ message: `Invalid allergen: ${allergen}` });
    }
  }

  await updateRestaurantMenuSectionDish(
    restaurantId,
    menuId,
    sectionId,
    dishId,
    name,
    description,
    rations,
    available,
    allergens
  );
  return res.status(200).json({ message: "Dish updated successfully" });
};

export const deleteDish = async (req, res) => {
  const { restaurantId, menuId, sectionId, dishId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Menu not found" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Section not found" });
  }
  if (!(await validateDishId(restaurantId, menuId, sectionId, dishId))) {
    return res.status(404).json({ message: "Dish not found" });
  }

  await deleteRestaurantMenuSectionDish(
    restaurantId,
    menuId,
    sectionId,
    dishId
  );
  return res.status(204).json({ message: "Dish deleted successfully" });
};
