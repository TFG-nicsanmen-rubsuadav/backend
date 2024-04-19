import { Router } from "express";

//local imports
import { checkAdmin } from "../middlewares/checkRoleAdmin.js";
import { deleteUser } from "../controllers/deleteUser.controller.js";

const router = Router();

router.delete("/delete/:id", checkAdmin, deleteUser);

export default router;
