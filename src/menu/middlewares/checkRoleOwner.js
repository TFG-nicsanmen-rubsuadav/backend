import { doc, getDocs, query, collection, where } from "firebase/firestore";
import admin from "firebase-admin";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getUserRole } from "../../auth/utils/utils.js";

export const checkOwner = async (req, res, next) => {
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
    if (roleName !== "owner" && roleName !== "admin") {
      return res.status(403).json({ error: "Not an admin or owner" });
    }

    req.user = userSnap.data();

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid token" });
  }
};
