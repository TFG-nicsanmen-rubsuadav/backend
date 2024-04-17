import { Router } from "express";

//local imports
import { createUser } from "../controllers/createUser.controller.js";
// import { checkAdmin } from "../middlewares/checkRoleAdmin.js";

const router = Router();

router.post("/create",  createUser);

export default router;
