import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// local imports
import { FIREBASE_DB, FIREBASE_AUTH } from "../../../firebaseConfig.js";
import { validate } from "../validators/validations.js";
import { populateUser, populateRoles } from "../utils/utils.js";

const roles = ["admin", "owner", "customer", "authorized"];

export const createUser = async (req, res) => {
  const { name, lastName, email, password, phone, birthDate, rol } = req.body;

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
    const roleDoc = doc(userDoc, "role", rolesIds[rol]);
    await setDoc(roleDoc, { name: rol });

    res.status(201).json({ success: "User created successfully" });
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        res.status(400).json({ email: "Email already in use" });
        break;
    }
  }
};
