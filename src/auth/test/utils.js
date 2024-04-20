import { randomInt } from "crypto";

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
