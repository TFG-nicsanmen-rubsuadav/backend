import { doc, getDocs, query, collection, where } from "firebase/firestore";
import admin from "firebase-admin";
import fs from "fs";
import { Buffer } from "buffer";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getUserRole } from "../utils/utils.js";

// External imports
import { config } from "dotenv";

config();

const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
const credentialsBytes = Buffer.from(credentialsBase64, "base64");

if (!fs.existsSync("credentials.json")) {
  fs.writeFileSync("credentials.json", credentialsBytes);
}

if (admin) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(fs.readFileSync("credentials.json"))
    ),
  });
}

export const checkAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    const userQuery = query(
      collection(FIREBASE_DB, "users"),
      where("email", "==", decodedToken.email)
    );

    const userQuerySnapshot = await getDocs(userQuery);
    const userSnap = userQuerySnapshot.docs[0];

    const userRef = doc(FIREBASE_DB, "users", userSnap.id);
    const roleName = await getUserRole(userRef);

    if (roleName !== "admin") {
      return res.status(403).json({ error: "Not an admin" });
    }

    req.user = userSnap.data();

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
