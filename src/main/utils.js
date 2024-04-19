import puppeteer from "puppeteer";
import fs from "fs";
import expressListEndpoints from "express-list-endpoints";

//local imports
import {
  NOT_AVAILABLE_FIELD,
  TRIPADVISOR,
  GOOGLE,
  THEFORK,
} from "./constants.js";
import { extractDataFromDetailsPage } from "./scrapping.js";

export async function openWebPage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  return { browser, page };
}

function refactorPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith("+34")) {
    phoneNumber = phoneNumber.slice(3);
  }
  phoneNumber = phoneNumber.replace(" ", "");
  phoneNumber = phoneNumber.replace("-", "");

  return phoneNumber;
}

export async function openDetailsPage(page) {
  let restaurantLinks = await page.$$eval(
    "div.resultItem h3.restaurantName > a",
    (links) => links.map((link) => link.href)
  );
  restaurantLinks = restaurantLinks.filter((link) => link.includes("/r/"));

  const details = [];

  for (const link of restaurantLinks) {
    await page.goto(link);

    // Extraer datos de la página del restaurante
    const restaurantDetails = await extractDataFromDetailsPage(
      page,
      refactorPhoneNumber,
      NOT_AVAILABLE_FIELD,
      TRIPADVISOR,
      GOOGLE,
      THEFORK
    );

    details.push(restaurantDetails);
  }

  return details;
}

export class ReviewSite {
  constructor(name) {
    this.name = name;
    this.numberOpinions = 0;
    this.score = 0.0;
  }

  processReviews(celda, row) {
    if (celda.includes(this.name)) {
      const reviewRow = row.querySelector("td.rightText");
      if (reviewRow) {
        this.numberOpinions = reviewRow.textContent.trim()
          ? parseInt(reviewRow.textContent.trim(), 10)
          : 0;

        const reviewRowScore = reviewRow.nextElementSibling;
        if (reviewRowScore && reviewRowScore.textContent.trim()) {
          try {
            this.score = parseFloat(
              reviewRowScore.textContent.replace(",", ".")
            );
          } catch (error) {
            this.score = 0.0;
          }
        } else {
          this.score = 0.0;
        }
      } else {
        this.numberOpinions = 0;
        this.score = 0.0;
      }
    }
  }
}

export function createSwaggerDocument(app) {
  let swagger = {
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: "API Endpoints",
    },
    paths: {},
  };
  const endpoints = expressListEndpoints(app);
  endpoints.forEach((endpoint) => {
    swagger.paths[endpoint.path] = {};
    endpoint.methods.forEach((method) => {
      swagger.paths[endpoint.path][method.toLowerCase()] = {
        summary: "",
        description: "",
      };
    });
  });
  if (!fs.existsSync("./swagger.json")) {
    fs.writeFileSync("./swagger.json", JSON.stringify(swagger, null, 2));
  }
}
