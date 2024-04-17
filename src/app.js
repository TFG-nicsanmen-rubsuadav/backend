import express from "express";
import morgan from "morgan";
import cors from "cors";
import "./config.js";
import "../firebaseConfig.js";
import { getDataFromWebPage } from "./main/scrapping.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use((req, res) => {
  res.status(404).json({ msg: "Not found" });
});

getDataFromWebPage();

export default app;
