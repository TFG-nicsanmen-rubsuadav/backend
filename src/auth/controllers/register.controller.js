import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// local imports
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../firebaseConfig.js";
import { validate } from "../validators/validations.js";
import { populateRoles, populateUser } from "../utils/utils.js";

export const register = async (req, res) => {
  const { name, lastName, email, password, phone, birthDate } = req.body;

  const val = validate(
    { name, lastName, email, password, phone, birthDate },
    true
  );
  if (Object.keys(val).length > 0) {
    return res.status(400).send(val);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );

    const user = userCredential.user;

    await populateUser(user.uid, {
      name,
      lastName,
      email,
      phone,
      birthDate,
      password,
    });

    const rolesIds = await populateRoles();

    const userDoc = doc(FIREBASE_DB, "users", user.uid);
    const roleDoc = doc(userDoc, "role", rolesIds["customer"]);
    await setDoc(roleDoc, { name: "customer" });

    const token = await user.getIdToken();
    res.status(201).json({ token, uid: user.uid });
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        res.status(400).json({ email: "Email already in use" });
        break;
    }
  }
};
