import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  setDoc,
} from "firebase/firestore";
import bcrypt from "bcrypt";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

export async function getUserDisplayNameByUid(uid) {
  const userRef = doc(FIREBASE_DB, "users", uid);
  const docSnap = await getDoc(userRef);
  switch (docSnap.exists()) {
    case true: {
      const name = docSnap.data().name;
      const lastName = docSnap.data().lastName;
      const displayName = `${name} ${lastName}`;
      return displayName;
    }
    case false:
      return null;
  }
}

export async function getUserRole(userRef) {
  const roleCollectionRef = collection(userRef, "role");
  const roleSnapshot = await getDocs(roleCollectionRef);

  let roleName = "";
  if (!roleSnapshot.empty) {
    roleName = roleSnapshot.docs[0].data().name;
  }

  return roleName;
}

export async function populateRoles() {
  const rolesCollection = collection(FIREBASE_DB, "roles");
  const roles = ["admin", "owner", "customer", "authorized"];
  let rolesIds = {};
  const existingRolesSnapshot = await getDocs(rolesCollection);
  const existingRoles = existingRolesSnapshot.docs.map((doc) => {
    rolesIds[doc.data().name] = doc.id;
    return doc.data().name;
  });
  for (const role of roles) {
    if (!existingRoles.includes(role)) {
      const docRef = await addDoc(rolesCollection, { name: role });
      rolesIds[role] = docRef.id;
    }
  }
  return rolesIds;
}

export async function populateUser(uid, user) {
  await setDoc(doc(FIREBASE_DB, "users", uid), {
    name: user["name"],
    lastName: user["lastName"],
    email: user["email"],
    phone: user["phone"],
    birthDate: user["birthDate"],
    passsword: await bcrypt.hash(user["password"], 10),
  });
}
