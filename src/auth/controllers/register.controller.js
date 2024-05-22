import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";

// local imports
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../firebaseConfig.js";
import { validate } from "../validators/validations.js";
import {
  populateRoles,
  populateUser,
  getCheckoutSession,
} from "../utils/utils.js";

const roles = ["owner", "customer", "admin"];

export const register = async (req, res) => {
  const { name, lastName, email, password, phone, birthDate, rol, restId } =
    req.body;

  if (!roles.includes(rol)) {
    return res.status(400).send({ rol: "Invalid role" });
  }

  const val = validate(
    { name, lastName, email, password, phone, birthDate },
    true
  );
  if (Object.keys(val).length > 0) {
    return res.status(400).send(val);
  }

  if (rol === "owner" && !restId) {
    return res.status(400).send({ restId: "You must select a restaurant" });
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );

    const user = userCredential.user;

    const userData = {
      name,
      lastName,
      email,
      phone,
      birthDate,
      password,
    };

    await populateUser(user.uid, userData);

    const rolesIds = await populateRoles();

    const userDoc = doc(FIREBASE_DB, "users", user.uid);
    const roleDoc = doc(userDoc, "role", rolesIds[rol]);
    await setDoc(roleDoc, { name: rol });

    const token = await user.getIdToken();

    if (rol === "owner") {
      const restaurantDoc = doc(FIREBASE_DB, "restaurants", restId);
      await updateDoc(userDoc, { restaurantId: restId });
      await updateDoc(restaurantDoc, { ownerId: user.uid });
      const { sessionId } = await getCheckoutSession(user, req, restId);
      return res.status(201).json({ token, uid: user.uid, sessionId, rol });
    }

    res.status(201).json({ token, uid: user.uid, rol });
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        res.status(400).json({ email: "Email already in use" });
        break;
    }
  }
};
