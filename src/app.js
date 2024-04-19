import express from "express";
import morgan from "morgan";
import cors from "cors";
import { collection, addDoc } from "firebase/firestore";

// local imports
import "./config.js";
import { FIREBASE_DB } from "../firebaseConfig.js";
import { getDataFromWebPage } from "./main/scrapping.js";
import registerRouter from "./auth/routes/register.routes.js";
import loginRoutes from "./auth/routes/login.routes.js";
import profileRoutes from "./auth/routes/profile.routes.js";
import createUserRoutes from "./auth/routes/createUser.routes.js";
import editUserRoutes from "./auth/routes/editUser.routes.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use("/auth/", registerRouter);
app.use("/auth/", loginRoutes);
app.use("/auth/", profileRoutes);
app.use("/auth/", createUserRoutes);
app.use("/auth/", editUserRoutes);

app.use("/scrapping", async (req, res) => {
  const data = await getDataFromWebPage();
  await saveDataToFirebase(data);
  res.status(200).send(data);
});

async function saveDataToFirebase(results) {
  const resultsCollection = collection(FIREBASE_DB, "restaurants");

  for (let result of results) {
    try {
      const { opinions, ...restaurantData } = result;
      const restaurantDocRef = await addDoc(resultsCollection, restaurantData);

      const opinionsCollection = collection(restaurantDocRef, "opinions");
      for (let opinion of opinions) {
        await addDoc(opinionsCollection, opinion);
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
}

export default app;
