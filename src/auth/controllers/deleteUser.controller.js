import { doc, deleteDoc, getDoc } from "firebase/firestore";

//local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { getUserRole, populateRoles } from "../utils/utils.js";

export const deleteUser = async (req, res) => {
  const userRef = doc(FIREBASE_DB, "users", req.params.id);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    return res.status(404).send({ message: "User not found" });
  }

  const userRole = await getUserRole(userRef);
  if (userRole === "admin") {
    res.status(401).send({ message: "You can't delete an admin account" });
  } else {
    const rolesIds = await populateRoles();

    const roleDoc = doc(userRef, "role", rolesIds[userRole]);
    await deleteDoc(roleDoc, { name: userRole });

    await deleteDoc(userRef);

    res.status(204).send({ message: "User deleted successfully" });
  }
};
