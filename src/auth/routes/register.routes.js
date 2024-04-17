import { Router } from "express";

//local imports
import { register } from "../controllers/register.controller.js";

const router = Router();

router.post("/register", register);

export default router;