import { doc, getDoc } from "firebase/firestore";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getUserRole } from "../utils/utils.js";

export const profile = async (req, res) => {
  const uid = req.params.id;

  try {
    const userRef = doc(FIREBASE_DB, "users", uid);
    const docSnap = await getDoc(userRef);

    const name = docSnap.data().name;
    const lastName = docSnap.data().lastName;
    const displayName = `${name} ${lastName}`;

    const roleName = await getUserRole(userRef);

    return res
      .status(200)
      .json({ ...docSnap.data(), displayName, rol: roleName });
  } catch (error) {
    return res.status(404).json({ error: "User not found" });
  }
};
