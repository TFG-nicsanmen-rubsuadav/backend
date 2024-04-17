import { Router } from "express";

//local imports
import { profile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/profile/:id", profile);

export default router;
