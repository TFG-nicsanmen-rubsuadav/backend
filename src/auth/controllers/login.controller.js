import { signInWithEmailAndPassword } from "firebase/auth";

// local imports
import { FIREBASE_AUTH } from "../../../firebaseConfig.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );

    const user = userCredential.user;

    const token = await user.getIdToken();
    res.status(200).json({ token });
  } catch (error) {
    switch (error.code) {
      case "auth/invalid-credential":
        res.status(400).json({ email: "Invalid credentials" });
        break;
      case "auth/user-disabled":
        res.status(400).json({ email: "The user is disabled" });
        break;
      case "auth/user-not-found":
        res.status(400).json({ email: "User not found" });
        break;
      case "auth/wrong-password":
        res.status(400).json({ password: "Wrong password" });
        break;
    }
  }
};
