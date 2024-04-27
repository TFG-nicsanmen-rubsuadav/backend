import { generatePhoneNumber } from "../../auth/test/utils.js";
import moment from "moment";
import { randomInt } from "crypto";

function getRandomBoolean() {
  return randomInt(0, 2) === 1;
}

function getRandomScore() {
  let score = randomInt(0, 101) / 10;
  return score.toFixed(1).replace(".", ",");
}

function getRandomNumberOpinions() {
  return randomInt(0, 5001);
}

function getRandomRating() {
  return randomInt(1, 6);
}

const restaurantNames = [
  "La Casa del Sabor",
  "El Rincon Gourmet",
  "Sabores del Mar",
  "Bistro Elegante",
  "Cocina de la Abuela",
  "Delicias Mediterráneas",
  "El Jardín Exótico",
  "La Trattoria",
  "Sushi Paraíso",
  "Parrilla de la Ciudad",
  "El Bodegón",
  "Mariscos del Pacífico",
  "La Pizzería",
  "El Asador",
  "Cocina Vegana",
  "El Paladar Exquisito",
  "Sabores Asiáticos",
  "El Taco Loco",
  "Burger House",
  "El Pollo Feliz",
  "La Paella Dorada",
  "El Sazón Casero",
  "La Cuchara de Plata",
  "El Gourmet Francés",
  "La Cocina Rápida",
  "El Sabor Italiano",
  "La Parrilla Argentina",
  "El Sushi Volador",
  "La Ensalada Fresca",
  "El Wok Chino",
  "La Pasta Suave",
  "El Taco Picante",
  "La Pizza Caliente",
  "El Pollo Asado",
  "La Hamburguesa Jugosa",
  "El Pescado Fresco",
  "La Ensalada Mixta",
  "El Sabor de la India",
  "La Cocina Mediterránea",
  "El Sabor del Caribe",
];

const prices = [20, 25, 30, 80, 15, 10, 40, 50];

const users = [
  "Usuario1",
  "Usuario2",
  "Usuario3",
  "Usuario4",
  "Usuario5",
  "Usuario6",
];

const reviews = [
  "Excelente servicio y comida deliciosa.",
  "Buena relación calidad-precio. Volveré seguro.",
  "No me gustó la comida y el servicio fue lento.",
  "La comida estaba bien, pero el servicio fue pésimo.",
  "No volveré a este restaurante. No me gustó nada.",
  "La comida estaba deliciosa, pero el servicio fue malo.",
  "Excelente comida y servicio. Volveré pronto.",
  "Buena comida, pero el servicio fue lento.",
  "No me gustó la comida y el servicio fue malo.",
];

const sites = ["Google", "TripAdvisor", "TheFork"];

export default Array.from({ length: 40 }, (_, i) => ({
  delivery: getRandomBoolean(),
  fullAddress: `Calle Falsa ${randomInt(1, 101)}, Ciudad ${i}`,
  googleNumberOpinions: getRandomNumberOpinions(),
  googleScore: parseFloat(getRandomScore().replace(",", ".")),
  image: `https://example.com/image-${i}.jpg`,
  phoneNumber: generatePhoneNumber(),
  price: prices[randomInt(0, prices.length)],
  restaurantName: restaurantNames[i % restaurantNames.length],
  score: getRandomScore(),
  takeAway: getRandomBoolean(),
  terrace: getRandomBoolean(),
  theForkNumberOpinions: getRandomNumberOpinions(),
  theForkScore: parseFloat(getRandomScore().replace(",", ".")),
  tripadvisorNumberOpinions: getRandomNumberOpinions(),
  tripadvisorScore: parseFloat(getRandomScore().replace(",", ".")),
  website: `https://restaurant-${i}.com`,
  opinions: Array.from({ length: 3 }, () => ({
    date: moment(new Date()).locale("es").format("DD MMMM YYYY"),
    rating: getRandomRating(),
    review: reviews[randomInt(0, reviews.length)],
    site: sites[randomInt(0, sites.length)],
    user: users[randomInt(0, users.length)],
  })),
}));
