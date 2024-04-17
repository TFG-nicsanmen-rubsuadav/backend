import { getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// local imports
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseConfig.js";

export const checkAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await getIdTokenResult(
      FIREBASE_AUTH.currentUser,
      true
    );

    const userRef = doc(FIREBASE_DB, "users", decodedToken.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      return res.status(403).json({ error: "Not an admin" });
    }

    req.user = userSnap.data();

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
