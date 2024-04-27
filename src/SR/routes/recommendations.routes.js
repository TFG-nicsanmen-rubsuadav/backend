import { Router } from "express";

//local imports
import { getRecommendations } from "../controllers/recommendations.controller.js";
import { checkLogin } from "../middlewares/checkLogin.js";

const router = Router();

router.get("/recommendations", checkLogin, getRecommendations);

export default router;
