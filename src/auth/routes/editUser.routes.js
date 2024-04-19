import { Router } from "express";

//local imports
import { editUser } from "../controllers/editUser.controller.js";
import { checkAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

router.patch("/editUser/:id", checkAdmin, editUser);

export default router;
