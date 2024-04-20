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
      case "auth/missing-email":
        res.status(400).json({ email: "Email is required" });
        break;
      case "auth/missing-password":
        res.status(400).json({ password: "Password is required" });
        break;
      case "auth/invalid-email":
        res.status(400).json({ email: "Invalid email" });
        break;
      case "auth/invalid-credential":
        res.status(400).json({ credentials: "Invalid credentials" });
        break;
    }
  }
};
