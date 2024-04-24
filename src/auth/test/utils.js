import request from "supertest";
import { randomInt } from "crypto";
import { signInWithCustomToken } from "firebase/auth";
import admin from "firebase-admin";

// local imports
import { FIREBASE_AUTH } from "../../../firebaseConfig.js";

export function generatePhoneNumber() {
  let phoneNumber = "";
  for (let i = 0; i < 9; i++) {
    if (i === 0) {
      phoneNumber += randomInt(6, 8);
    } else {
      phoneNumber += randomInt(0, 10);
    }
  }
  return phoneNumber;
}

export function generateRandomEmail() {
  let randomName = "";
  for (let i = 0; i < 10; i++) {
    let randomChar = String.fromCharCode(randomInt(0, 26) + "a".charCodeAt(0));
    randomName += randomChar;
  }
  return `${randomName}@gmail.com`;
}

export async function authenticateUser(user, app) {
  const response = await request(app).post("/auth/register").send(user);
  const uid = response.body.uid;
  const customToken = await admin.auth().createCustomToken(uid);
  const userCredentials = await signInWithCustomToken(
    FIREBASE_AUTH,
    customToken
  );
  return {
    uid: uid,
    idToken: await userCredentials.user.getIdToken(),
  };
}
