import { Router } from "express";

//local imports
import { editUserAsAdmin } from "../controllers/editUser.controller.js";
import { checkAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

router.patch("/editUser/:id", checkAdmin, editUserAsAdmin);

export default router;
