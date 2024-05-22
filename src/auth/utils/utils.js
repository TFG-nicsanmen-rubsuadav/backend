import {
  doc,
  collection,
  getDocs,
  addDoc,
  setDoc,
  onSnapshot,
  where,
  query,
} from "firebase/firestore";
import bcrypt from "bcrypt";

// local imports
import { FIREBASE_DB } from "../../../firebaseConfig.js";

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

async function createPaymentSession(user, req, restId) {
  const checkoutSessionsRef = collection(
    FIREBASE_DB,
    "users",
    user.uid,
    "checkout_sessions"
  );
  const docRef = await addDoc(checkoutSessionsRef, {
    price: "price_1P8kwkA8KMaHM1rgyAdexqDP",
    success_url: `https://tfg-nico-ruben.web.app/restaurant/${restId}`,
    cancel_url: "https://tfg-nico-ruben.web.app/login",
  });

  return new Promise((resolve, reject) => {
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const { error, url } = snap.data();
        if (error) {
          reject(error.message);
        }
        if (url) {
          resolve({ sessionId: url });
        }
      } else {
        reject("No data available");
      }
    });
  });
}

export async function getCheckoutSession(user, req, restId) {
  try {
    const url = await createPaymentSession(user, req, restId);
    return url;
  } catch (error) {
    return error;
  }
}

export async function getUserRoleByEmail(email) {
  const usersRef = collection(FIREBASE_DB, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const user = querySnapshot.docs[0];
    const roleRef = collection(doc(FIREBASE_DB, "users", user.id), "role");
    const roleSnapshot = await getDocs(roleRef);
    if (!roleSnapshot.empty) {
      const roleName = roleSnapshot.docs[0].data().name;
      return roleName;
    }
  } else {
    throw new Error("User not found");
  }
}

export async function getUserIdByEmail(email) {
  const collectionRef = collection(FIREBASE_DB, "users");
  const q = query(collectionRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0].ref.id;
}

export async function checkOwnerActiveSubscription(email) {
  const userCollection = await getUserIdByEmail(email);
  const subscriptionCollectionRef = collection(
    FIREBASE_DB,
    "users",
    userCollection,
    "subscriptions"
  );
  const subscriptionSnapshot = await getDocs(subscriptionCollectionRef);

  let active = false;
  if (!subscriptionSnapshot.empty) {
    active = subscriptionSnapshot.docs[0].data().status;
  }

  return active;
}
