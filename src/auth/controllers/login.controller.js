import { signInWithEmailAndPassword } from "firebase/auth";

// local imports
import { FIREBASE_AUTH } from "../../../firebaseConfig.js";
import {
  checkOwnerActiveSubscription,
  getUserRoleByEmail,
} from "../utils/utils.js";

const validateLoginData = (email, password, res) => {
  if (!email || !password) {
    return res.status(400).json({
      email: "Email is required",
      password: "Password is required",
    });
  }
};

const handleLoginError = (error, res) => {
  let errorMessage = error.message.match(/\(([^)]+)\)/);
  errorMessage = errorMessage ? errorMessage[1] : error.message;
  switch (errorMessage) {
    case "User not found":
      res.status(404).json({ email: "User with current email not found" });
      break;
    case "auth/invalid-credential":
      res.status(400).json({ password: "Invalid password" });
      break;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  validateLoginData(email, password, res);
  try {
    const userRole = await getUserRoleByEmail(email);
    const activeSubscription = await checkOwnerActiveSubscription(email);

    if (!activeSubscription && userRole === "owner") {
      return res.status(400).json({
        subscription: "You need an active subscription to login",
      });
    }
    const userCredential = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );

    const token = await userCredential.user.getIdToken();
    res.status(200).json({ token });
  } catch (error) {
    handleLoginError(error, res);
  }
};
