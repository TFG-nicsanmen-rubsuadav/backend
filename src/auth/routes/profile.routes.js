import { Router } from "express";

//local imports
import { profile } from "../controllers/profile.controller.js";
import { editUser } from "../controllers/editUser.controller.js";
import { verifyUser } from "../middlewares/checkUpdateProfile.js";

const router = Router();

router.get("/profile/:id", profile);
router.patch("/profile/:id", verifyUser, editUser);

export default router;
