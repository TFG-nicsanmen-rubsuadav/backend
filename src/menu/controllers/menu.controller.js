import { createRestaurantMenu } from "../models/models.js";
import { validateMenuData, validateMenuId } from "../validators/validations.js";

export const createMenu = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId } = req.params;
  try {
    if (!validateMenuId(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }
    if (!validateMenuData(name, available)) {
      return res.status(400).json({ message: "Invalid menu data" });
    }
    await createRestaurantMenu(restaurantId, name, description, available);
    res.status(201).json({ message: "Menu created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
