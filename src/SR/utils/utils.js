import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import moment from "moment";
import { randomInt } from "crypto";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

function getRandomizeSite() {
  const sites = ["Google", "Tripadvisor"];
  return sites[randomInt(sites.length)];
}

async function saveOpinionToRestaurant(restaurantId, review) {
  await addDoc(
    collection(FIREBASE_DB, "restaurants", restaurantId, "opinions"),
    review
  );
}

async function getDocuments(collectionName) {
  const snapshot = await getDocs(collection(FIREBASE_DB, collectionName));

  let documents = [];

  snapshot.forEach((doc) => {
    const document = doc.data();
    document.id = doc.id;
    documents.push(document);
  });

  return documents;
}

export async function getRestaurants() {
  return await getDocuments("restaurants");
}

async function getUsers() {
  return await getDocuments("users");
}

async function userHasRatedRestaurant(userId, restaurantId) {
  const userOpinionsQuery = query(
    collection(FIREBASE_DB, "restaurants", restaurantId, "opinions"),
    where("user", "==", userId)
  );
  const userOpinionsSnapshot = await getDocs(userOpinionsQuery);
  return !userOpinionsSnapshot.empty;
}

export async function generateRandomReviews(userDisplayName) {
  const restaurants = await getRestaurants();

  let selectedRestaurants = [];
  let userHasRated = false;
  for (let i = 0; i < 12; i++) {
    if (userHasRated) break;

    let restaurant;
    let found = false;
    while (!found) {
      restaurant = restaurants[randomInt(restaurants.length)];
      if (
        !selectedRestaurants.includes(restaurant.id) &&
        !(await userHasRatedRestaurant(userDisplayName, restaurant.id))
      ) {
        found = true;
      } else {
        userHasRated = true;
        break;
      }
    }

    if (userHasRated) break;

    selectedRestaurants.push(restaurant.id);

    const review = {
      rating: randomInt(5) + 1,
      review: "Esta es una opinión generada aleatoriamente.",
      date: moment(new Date()).locale("es").format("DD MMMM YYYY"),
      user: userDisplayName,
      site: getRandomizeSite(),
    };

    console.log(`Saving review for restaurant ${restaurant.id}`);

    await saveOpinionToRestaurant(restaurant.id, review);
  }
}

export async function getUserDataByUid(uid) {
  const users = await getUsers();
  return users.find((user) => user.id === uid);
}
