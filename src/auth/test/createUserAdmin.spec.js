import request from "supertest";
import { doc, setDoc } from "firebase/firestore";

// local imports
import app from "../../app";
import { FIREBASE_DB } from "../../../firebaseConfig.js";
import { authenticateUser } from "./utils.js";
import mainUser, { mainUser8 } from "./mainUserForMiddelware.js";
import { populateRoles } from "../utils/utils.js";

let uid;
let uid2;
let adminToken;
let userToken;

beforeAll(async () => {
  const adminAuth = await authenticateUser(mainUser, app);
  uid = adminAuth.uid;
  adminToken = adminAuth.idToken;

  const userAuth = await authenticateUser(mainUser8, app);
  uid2 = userAuth.uid;
  userToken = userAuth.idToken;
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
      .send({
        name: "rfrgr",
        lastName: "rfgrg",
        email: "emailrandom@gmail.com",
        password: "@Password1234",
        phone: "696010910",
        birthDate: "10/07/2012",
        rol: "admin",
      });
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
      .set("Authorization", adminToken)
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
      .set("Authorization", adminToken)
      .send({ ...mainUser, rol: "invalid" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("rol");
  });
});
