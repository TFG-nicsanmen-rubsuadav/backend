import request from "supertest";
import { signInWithCustomToken } from "firebase/auth";
import admin from "firebase-admin";
import { doc, setDoc } from "firebase/firestore";

// local imports
import app from "../../app";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseConfig.js";
import { mainUser2, mainUser3 } from "./mainUserForMiddelware.js";
import { populateRoles } from "../utils/utils.js";

let uid;
let userToken;

beforeAll(async () => {
  const response = await request(app).post("/auth/register").send(mainUser2);
  uid = response.body.uid;
  const customToken = await admin.auth().createCustomToken(uid);
  const userCredentials = await signInWithCustomToken(
    FIREBASE_AUTH,
    customToken
  );
  userToken = await userCredentials.user.getIdToken();
});

describe("Controlling user deletion with admin middleware throwing invalids tokens", () => {
  it("no token provider", async () => {
    const res = await request(app).delete`/auth/delete/${uid}`;
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  });
  it("invalid token", async () => {
    const res = await request(app)
      .delete(`/auth/delete/${uid}`)
      .set("Authorization", "Bearer invalidToken");
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
  it("valid token but not admin", async () => {
    const res = await request(app)
      .delete(`/auth/delete/${uid}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
});

describe("Controlling user deletion with admin middleware throwing valid tokens", () => {
  it("valid token but user not found", async () => {
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid);
    const roleDoc = doc(userDoc, "role", rolesIds["admin"]);
    await setDoc(roleDoc, { name: "admin" });
    const res = await request(app)
      .delete(`/auth/delete/invalidUid`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("message");
  });
  it("valid token and user found and cant delete because is admin", async () => {
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid);
    const roleDoc = doc(userDoc, "role", rolesIds["admin"]);
    await setDoc(roleDoc, { name: "admin" });
    const res = await request(app)
      .delete(`/auth/delete/${uid}`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("message");
  });

  it("valid token and user found and deleted", async () => {
    const response2 = await request(app).post("/auth/register").send(mainUser3);
    const uid2 = response2.body.uid;
    console.log(uid2);
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid2);
    const roleDoc = doc(userDoc, "role", rolesIds["customer"]);
    await setDoc(roleDoc, { name: "customer" });
    const res = await request(app)
      .delete(`/auth/delete/${uid2}`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(204);
    expect(res.body).toHaveProperty("message");
  });
});
