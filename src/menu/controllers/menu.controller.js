import {
  createRestaurantMenu,
  updateRestaurantMenu,
  deleteRestaurantMenu,
  createRestaurantMenuSection,
  updateRestaurantMenuSection,
  deleteRestaurantMenuSection,
} from "../models/models.js";
import {
  getRestaurantMenu,
  getMenuById,
  getRestaurantMenuSection,
  getMenuSectionById,
} from "../utils/utils.js";
import {
  validateMenuData,
  validateRestaurantId,
  validateMenuId,
  validateSectionId,
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
    return res.status(404).json({ message: "Invalid restaurant id" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Invalid menu id" });
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
    return res.status(404).json({ message: "Invalid restaurant id" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Invalid menu id" });
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
    return res.status(404).json({ message: "Invalid restaurant id" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Invalid menu id" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Invalid section id" });
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
    return res.status(404).json({ message: "Invalid restaurant id" });
  }
  if (!(await validateMenuId(restaurantId, menuId))) {
    return res.status(404).json({ message: "Invalid menu id" });
  }
  if (!(await validateSectionId(restaurantId, menuId, sectionId))) {
    return res.status(404).json({ message: "Invalid section id" });
  }

  await deleteRestaurantMenuSection(restaurantId, menuId, sectionId);
  return res.status(204).json({ message: "Section deleted successfully" });
};
