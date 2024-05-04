import { createRestaurantMenu } from "../models/models.js";
import { getRestaurantMenu } from "../utils/utils.js";
import {
  validateMenuData,
  validateRestaurantId,
} from "../validators/validations.js";

export const createMenu = async (req, res) => {
  const { name, description, available } = req.body;
  const { restaurantId } = req.params;
  if (!(await validateRestaurantId(restaurantId))) {
    return res.status(400).json({ message: "Invalid restaurant id" });
  }
  if (!validateMenuData(name, available)) {
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
