// local imports
import { recommendRestaurants } from "../utils/recommendations.js";
import { getUserDataByUid, generateRandomReviews } from "../utils/utils.js";

export const getRecommendations = async (req, res) => {
  const user = await getUserDataByUid(req.user.uid);
  await generateRandomReviews(user.name + " " + user.lastName);
  return res.status(200).json({
    recommendations: await recommendRestaurants(
      user.name + " " + user.lastName
    ),
  });
};
