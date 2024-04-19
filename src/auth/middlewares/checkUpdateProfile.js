import admin from "firebase-admin";
import { getDocs, query, collection, where } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export const verifyUser = async (req, res, next) => {
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

    if (userSnap.id === req.params.id) {
      req.user = userSnap.data();
      next();
    } else {
      res.status(403).json({ error: "You can only update your profile" });
    }
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
