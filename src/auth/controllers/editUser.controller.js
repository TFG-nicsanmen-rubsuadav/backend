import { doc, updateDoc, getDoc } from "firebase/firestore";
import bcrypt from "bcrypt";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { validate } from "../validators/validations.js";

export const editUserAsAdmin = async (req, res) => {
  const { name, lastName, email, password, phone, birthDate } = req.body;

  const val = validate(
    { name, lastName, email, password, phone, birthDate },
    false
  );
  if (Object.keys(val).length > 0) {
    return res.status(400).send(val);
  }

  try {
    const userRef = doc(FIREBASE_DB, "users", req.params.id);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      return res.status(404).send({ message: "User not found" });
    }

    const updatedData = {};
    if (name) updatedData.name = name;
    if (lastName) updatedData.lastName = lastName;
    if (email) updatedData.email = email;
    if (password) updatedData.password = await bcrypt.hash(password, 10);
    if (phone) updatedData.phone = phone;
    if (birthDate) updatedData.birthDate = birthDate;

    await updateDoc(userRef, updatedData);

    res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        res.status(400).json({ email: "Email already in use" });
        break;
      case "auth/invalid-email":
        res.status(400).json({ email: "Invalid email" });
        break;
      case "auth/weak-password":
        res.status(400).json({ password: "Weak password" });
        break;
      case "auth/user-not-found":
        res.status(404).json({ user: "User not found" });
        break;
    }
  }
};
