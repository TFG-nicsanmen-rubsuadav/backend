import { collection, getDocs, query, where } from "firebase/firestore";
import { cosineSimilarity } from "cosine-similarity-threshold";
import { randomInt } from "crypto";

// local imports
import { getRestaurants } from "./utils.js";
import { FIREBASE_DB } from "../../../firebaseConfig.js";

// 1) Creamos la matriz de características de los restaurantes
function createFeatureMatrix(restaurants) {
  let featureMatrix = [];

  for (let restaurant of restaurants) {
    const takeAway = restaurant.takeAway ? 1 : 0;
    const terrace = restaurant.terrace ? 1 : 0;
    const googleScore = restaurant.googleScore;
    const theForkScore = restaurant.theForkScore;
    const tripadvisorScore = restaurant.tripadvisorScore;
    const score = parseFloat(restaurant.score.replace(",", "."));

    let featureVector = [
      takeAway,
      terrace,
      googleScore,
      theForkScore,
      tripadvisorScore,
      score,
    ];
    featureMatrix.push({ id: restaurant.id, vector: featureVector });
  }

  return featureMatrix;
}

// Actualizar las preferencias del usuario basándose en las opiniones
function updateUserPreferences(userPreferences, restaurant, opinion) {
  if (opinion.rating >= 3 && (restaurant.takeAway || restaurant.terrace)) {
    userPreferences.takeAway += (restaurant.takeAway ? 1 : 0) * opinion.rating;
    userPreferences.terrace += (restaurant.terrace ? 1 : 0) * opinion.rating;
    userPreferences.googleScore += restaurant.googleScore * opinion.rating;
    userPreferences.theForkScore += restaurant.theForkScore * opinion.rating;
    userPreferences.tripadvisorScore +=
      restaurant.tripadvisorScore * opinion.rating;
    userPreferences.score +=
      parseFloat(restaurant.score.replace(",", ".")) * opinion.rating;
  }
  return userPreferences;
}

// Obtener las opiniones del usuario para un restaurante
async function getUserOpinionsForRestaurant(restaurantDoc, userDisplayName) {
  const userOpinionsQuery = query(
    collection(restaurantDoc.ref, "opinions"),
    where("user", "==", userDisplayName)
  );
  return await getDocs(userOpinionsQuery);
}

// 2) Creamos la matriz de características de los usuarios
async function getUserPreferences(userDisplayName) {
  const restaurantsSnapshot = await getDocs(
    collection(FIREBASE_DB, "restaurants")
  );

  let userPreferences = {
    takeAway: 0,
    terrace: 0,
    googleScore: 0,
    theForkScore: 0,
    tripadvisorScore: 0,
    score: 0,
  };

  for (let doc of restaurantsSnapshot.docs) {
    const restaurant = doc.data();
    const userOpinionsSnapshot = await getUserOpinionsForRestaurant(
      doc,
      userDisplayName
    );

    for (let opinionDoc of userOpinionsSnapshot.docs) {
      const opinion = opinionDoc.data();
      userPreferences = updateUserPreferences(
        userPreferences,
        restaurant,
        opinion
      );
    }
  }
  return userPreferences;
}

// 3) Calculamos la similitud entre las preferencias del usuario y los restaurantes para recomendar los N mejores restaurantes
export async function recommendRestaurants(userDisplayName) {
  const userPreferences = await getUserPreferences(userDisplayName);
  const restaurants = await getRestaurants();
  const featureMatrix = createFeatureMatrix(restaurants);

  let similarities = featureMatrix.map((restaurant) => {
    return {
      id: restaurant.id,
      similarity: cosineSimilarity(
        Object.values(userPreferences),
        restaurant.vector
      ),
    };
  });

  // Obtenemos las similitudes mayores a 0.6
  similarities = similarities.filter(
    (similarity) => similarity.similarity > 0.6
  );

  // Ordenamos los restaurantes por similitud
  for (let i = similarities.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    const temp = similarities[i];
    similarities[i] = similarities[j];
    similarities[j] = temp;
  }

  return similarities.slice(0, 5);
}
