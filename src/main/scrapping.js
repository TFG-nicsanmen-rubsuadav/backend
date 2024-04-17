// local imports
import {
  MAIN_URL,
  NOT_AVAILABLE_FIELD,
  GOOGLE,
  TRIPADVISOR,
  THEFORK,
} from "./constants.js";
import { openWebPage, openDetailsPage, ReviewSite } from "./utils.js";

function getRestaurantServices(restaurant) {
  let delivery = false;
  let takeAway = false;
  let terrace = false;

  const services = Array.from(restaurant.querySelectorAll("a.btn"));
  for (const service of services) {
    const label = service.querySelector("i").getAttribute("title");
    if (label.includes("Pedidos para llevar")) {
      takeAway = true;
    } else if (label.includes("Terraza")) {
      terrace = true;
    } else if (label.includes("Pedidos a domicilio")) {
      delivery = true;
    }
  }

  return { delivery, takeAway, terrace };
}

function getRestaurantMainInfo(restaurant, NOT_AVAILABLE_FIELD) {
  const nameElement = restaurant.querySelector("h3.restaurantName");
  const restaurantName = nameElement
    ? nameElement.innerText.trim()
    : NOT_AVAILABLE_FIELD;

  const priceElement = restaurant.querySelector("span.price.info");
  const price = priceElement
    ? priceElement.innerText.trim()
    : NOT_AVAILABLE_FIELD;

  const imageElement = restaurant.querySelector("div.col-md-7 a img");
  const image = imageElement ? imageElement.dataset.src : NOT_AVAILABLE_FIELD;

  return { restaurantName, price, image };
}

async function extractDataFromWebPage(page) {
  return await page.evaluate(
    (getRestaurantMainInfo, getRestaurantServices, NOT_AVAILABLE_FIELD) => {
      const restaurants = Array.from(
        document.querySelectorAll("div.resultItem")
      );
      return restaurants.map((restaurant) => {
        const getRestaurantInfo = eval(`(${getRestaurantMainInfo})`);
        const getServices = eval(`(${getRestaurantServices})`);

        const { restaurantName, price, image } = getRestaurantInfo(
          restaurant,
          NOT_AVAILABLE_FIELD
        );
        const { delivery, takeAway, terrace } = getServices(restaurant);

        return {
          restaurantName,
          price,
          image,
          delivery,
          takeAway,
          terrace,
        };
      });
    },
    getRestaurantMainInfo.toString(),
    getRestaurantServices.toString(),
    NOT_AVAILABLE_FIELD
  );
}

//details methods
function getOtherRestaurantInfo(refactorPhoneNumber, NOT_AVAILABLE_FIELD) {
  let data, dataAddress;

  try {
    data = document.querySelector("section.row div.hl_row");
    dataAddress = data ? data.querySelector("a") : null;
  } catch (error) {
    data = NOT_AVAILABLE_FIELD;
    dataAddress = NOT_AVAILABLE_FIELD;
  }

  let streetAddress = dataAddress
    ? dataAddress.querySelector("span")?.innerText.trim()
    : NOT_AVAILABLE_FIELD;

  let addressLocality = dataAddress
    ? dataAddress
        .querySelector("span[itemprop='addressLocality']")
        ?.innerText.trim()
    : NOT_AVAILABLE_FIELD;

  let fullAddress = `${streetAddress}, ${addressLocality}`;

  let phoneNumber = data
    ? refactorPhoneNumber(
        data.querySelector("a.i-block span")?.innerText.trim()
      )
    : NOT_AVAILABLE_FIELD;

  let div = data ? data.querySelector("div.pull-right") : null;
  let website =
    div && div.querySelector("a")
      ? div.querySelector("a").getAttribute("href")
      : NOT_AVAILABLE_FIELD;

  return { fullAddress, phoneNumber, website };
}

function getRestaurantScore(NOT_AVAILABLE_FIELD) {
  let globalScore;

  try {
    const rankingSection = document.querySelector("section#ranking");
    const rankingDiv = rankingSection.querySelector("div.ranking");
    const globalRankingBar = rankingDiv.querySelector("div#globalrankingbar");
    const spanClass = globalRankingBar.querySelector("span").className;
    globalScore = spanClass ? spanClass.replace(".", ",") : NOT_AVAILABLE_FIELD;
  } catch (error) {
    globalScore = NOT_AVAILABLE_FIELD;
  }

  return globalScore;
}

function getRestaurantRanking(NOT_AVAILABLE_FIELD) {
  let dataTable;

  try {
    const reviewsSection = document.querySelector(
      "section.container.nopadding.reviews"
    );
    dataTable = reviewsSection.querySelectorAll("div.reviewsBySite table");
  } catch (error) {
    dataTable = NOT_AVAILABLE_FIELD;
  }

  const tripadvisor = new ReviewSite(TRIPADVISOR);
  const google = new ReviewSite(GOOGLE);
  const theFork = new ReviewSite(THEFORK);

  dataTable.forEach((dato) => {
    const rows = Array.from(dato.querySelectorAll("tr")).slice(1);
    rows.forEach((row) => {
      const celda = row.querySelector("a.sitename img").title;

      tripadvisor.processReviews(celda, row);
      google.processReviews(celda, row);
      theFork.processReviews(celda, row);
    });
  });

  return {
    tripadvisorNumberOpinions: tripadvisor.numberOpinions,
    tripadvisorScore: tripadvisor.score,
    googleNumberOpinions: google.numberOpinions,
    googleScore: google.score,
    theForkNumberOpinions: theFork.numberOpinions,
    theForkScore: theFork.score,
  };
}

function getRestaurantOpinions(NOT_AVAILABLE_FIELD) {
  const commentsData = document.querySelectorAll(
    "section.container.nopadding.reviews div#reviews div[itemprop='review']"
  );

  const commentsList = [];

  for (const data of commentsData) {
    const comment = {};

    comment["review"] = data.querySelector("div.text").textContent.trim();

    const usersData = data.querySelector("div.userSite.pull-left");

    comment["date"] = usersData
      .querySelector("div.ratingDate")
      .textContent.trim();
    comment["user"] = usersData.querySelector("span").textContent.trim();
    // TODO: solve the problem with the rating
    comment["rating"] = parseFloat(
      usersData.querySelector("span.stars").textContent.trim().replace(",", ".")
    );

    let site = data
      .querySelector("div.pull-right.site span a")
      .textContent.trim();

    if (![TRIPADVISOR, GOOGLE, THEFORK].includes(site)) {
      site = NOT_AVAILABLE_FIELD;
    }

    comment["site"] = site;
    commentsList.push(comment);
  }

  return commentsList;
}

export async function extractDataFromDetailsPage(
  page,
  refactorPhoneNumber,
  NOT_AVAILABLE_FIELD,
  TRIPADVISOR,
  GOOGLE,
  THEFORK
) {
  const ReviewSiteDefinition = ReviewSite.toString();
  const getRestaurantOpinionsDefinition = getRestaurantOpinions.toString();
  return await page.evaluate(
    (
      getOtherRestaurantInfo,
      getRestaurantScore,
      getRestaurantRanking,
      getRestaurantOpinionsDefinition,
      refactorPhoneNumber,
      NOT_AVAILABLE_FIELD,
      ReviewSiteDefinition,
      TRIPADVISOR,
      GOOGLE,
      THEFORK
    ) => {
      const getDetails = eval(`(${getOtherRestaurantInfo})`);
      const getScore = eval(`(${getRestaurantScore})`);
      const getRanking = eval(`(${getRestaurantRanking})`);
      const refactorPhone = eval(`(${refactorPhoneNumber})`);
      const ReviewSite = eval(`(${ReviewSiteDefinition})`);
      const getOpinions = eval(`(${getRestaurantOpinionsDefinition})`);

      const details = getDetails(refactorPhone, NOT_AVAILABLE_FIELD);
      const score = getScore(NOT_AVAILABLE_FIELD);
      const ranking = getRanking(
        NOT_AVAILABLE_FIELD,
        TRIPADVISOR,
        GOOGLE,
        THEFORK
      );
      const opinions = getOpinions(NOT_AVAILABLE_FIELD);
      return { ...details, score, ranking, opinions };
    },
    getOtherRestaurantInfo.toString(),
    getRestaurantScore.toString(),
    getRestaurantRanking.toString(),
    getRestaurantOpinionsDefinition,
    refactorPhoneNumber.toString(),
    NOT_AVAILABLE_FIELD,
    ReviewSiteDefinition,
    TRIPADVISOR,
    GOOGLE,
    THEFORK
  );
}

export async function getDataFromWebPage() {
  const results = [];

  for (let i = 1; i <= 3; i++) {
    const { browser, page } = await openWebPage(
      `${MAIN_URL}/restaurantes/?page=${i}`
    );

    const data = await extractDataFromWebPage(page);

    const details = await openDetailsPage(page);

    for (let j = 0; j < data.length; j++) {
      const combinedData = {
        ...data[j],
        fullAddress: details[j].fullAddress,
        phoneNumber: details[j].phoneNumber,
        website: details[j].website,
        score: details[j].score,
        ...details[j].ranking,
        opinions: details[j].opinions,
      };

      results.push(combinedData);
    }

    await browser.close();
  }

  return results;
}
