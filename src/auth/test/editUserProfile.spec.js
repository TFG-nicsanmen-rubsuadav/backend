import request from "supertest";
import { signInWithCustomToken } from "firebase/auth";
import admin from "firebase-admin";
import { doc, setDoc } from "firebase/firestore";

// local imports
import app from "../../app";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseConfig.js";
import {
  mainUser4,
  mainUser5,
  mainUser6,
  mainUser7,
} from "./mainUserForMiddelware.js";
import { populateRoles } from "../utils/utils.js";

let uid;
let userToken;

beforeAll(async () => {
  const response = await request(app).post("/auth/register").send(mainUser4);
  uid = response.body.uid;
  const customToken = await admin.auth().createCustomToken(uid);
  const userCredentials = await signInWithCustomToken(
    FIREBASE_AUTH,
    customToken
  );
  userToken = await userCredentials.user.getIdToken();
});

describe("Controlling user update with admin middleware throwing invalids tokens", () => {
  it("no token provider", async () => {
    const res = await request(app).patch`/auth/editUser/${uid}`;
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  });
  it("invalid token", async () => {
    const res = await request(app)
      .patch(`/auth/editUser/${uid}`)
      .set("Authorization", "Bearer invalidToken");
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
  it("valid token but not admin", async () => {
    const res = await request(app)
      .patch(`/auth/editUser/${uid}`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
});

describe("Controlling user update with admin middleware throwing valid tokens", () => {
  it("valid token but user not found", async () => {
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid);
    const roleDoc = doc(userDoc, "role", rolesIds["admin"]);
    await setDoc(roleDoc, { name: "admin" });
    const res = await request(app)
      .patch(`/auth/editUser/invalidUid`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("message");
  });

  it("valid token and user found and updated unnsuccesfully cause bad data", async () => {
    const response2 = await request(app).post("/auth/register").send(mainUser5);
    const uid2 = response2.body.uid;
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid2);
    const roleDoc = doc(userDoc, "role", rolesIds["customer"]);
    await setDoc(roleDoc, { name: "customer" });
    const res = await request(app)
      .patch(`/auth/editUser/${uid2}`)
      .set("Authorization", userToken)
      .send({ name: "d" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("nameError");
  });

  it("valid token and user found and updated successfully", async () => {
    const response2 = await request(app).post("/auth/register").send(mainUser6);
    const uid2 = response2.body.uid;
    const rolesIds = await populateRoles();
    const userDoc = doc(FIREBASE_DB, "users", uid2);
    const roleDoc = doc(userDoc, "role", rolesIds["customer"]);
    await setDoc(roleDoc, { name: "customer" });
    const res = await request(app)
      .patch(`/auth/editUser/${uid2}`)
      .set("Authorization", userToken)
      .send({
        name: "nuevos macarrones",
        lastName: "con queso",
        email: "habichuelasmar@gmail.com",
        password: "@Passwoddrd1234",
        phone: "696112110",
        birthDate: "10/07/2018",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message");
  });
});

describe("Controlling updating user profile with own profile middelware", () => {
  it("no token provider", async () => {
    const res = await request(app).patch(`/auth/profile/${uid}`);
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  });
  it("invalid token", async () => {
    const res = await request(app)
      .patch(`/auth/profile/${uid}`)
      .set("Authorization", "Bearer invalidToken");
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
  it("valid token but trying to update another user's profile", async () => {
    const response2 = await request(app).post("/auth/register").send(mainUser7);
    const uid2 = response2.body.uid;
    const res = await request(app)
      .patch(`/auth/profile/${uid2}`)
      .set("Authorization", userToken);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toEqual("You can only update your profile");
  });
});
