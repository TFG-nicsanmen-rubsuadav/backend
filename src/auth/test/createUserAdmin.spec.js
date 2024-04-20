import request from "supertest";
import { signInWithCustomToken } from "firebase/auth";
import admin from "firebase-admin";
import { doc, setDoc } from "firebase/firestore";

// local imports
import app from "../../app";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../firebaseConfig.js";
import mainUser from "./mainUserForMiddelware.js";
import { populateRoles } from "../utils/utils.js";

let uid;
let userToken;

beforeAll(async () => {
  const response = await request(app).post("/auth/register").send(mainUser);
  uid = response.body.uid;
  const customToken = await admin.auth().createCustomToken(uid);
  const userCredentials = await signInWithCustomToken(
    FIREBASE_AUTH,
    customToken
  );
  userToken = await userCredentials.user.getIdToken();
});

describe("Controlling user creation with admin middleware throwing invalids tokens", () => {
  it("no token provider", async () => {
    const res = await request(app).post("/auth/create").send({
      email: "userprueba@hotmail.com",
      password: "@Password1234",
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty("error");
  });

  it("invalid token", async () => {
    const res = await request(app)
      .post("/auth/create")
      .set("Authorization", "invalidToken")
      .send(mainUser);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });

  it("not admin", async () => {
    const res = await request(app)
      .post("/auth/create")
      .set("Authorization", userToken)
      .send(mainUser);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty("error");
  });
});

describe("Tests cases with admin middleware", () => {
  it("creating user", async () => {
    const rolesIds = await populateRoles();

    const userDoc = doc(FIREBASE_DB, "users", uid);
    const roleDoc = doc(userDoc, "role", rolesIds["admin"]);
    await setDoc(roleDoc, { name: "admin" });

    const res = await request(app)
      .post("/auth/create")
      .set("Authorization", userToken)
      .send({
        name: "Test14",
        lastName: "User24",
        email: "usernew@hotmail.com",
        password: "@Password1234",
        phone: "696010910",
        birthDate: "10/07/2012",
        rol: "admin",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("success");
  });

  it("creating user with invalid role", async () => {
    const rolesIds = await populateRoles();

    const userDoc = doc(FIREBASE_DB, "users", uid);
    const roleDoc = doc(userDoc, "role", rolesIds["admin"]);
    await setDoc(roleDoc, { name: "admin" });

    const res = await request(app)
      .post("/auth/create")
      .set("Authorization", userToken)
      .send({ ...mainUser, rol: "invalid" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("rol");
  });
});
