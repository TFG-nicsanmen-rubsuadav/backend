export function generatePhoneNumber() {
  let phoneNumber = "";
  for (let i = 0; i < 9; i++) {
    if (i === 0) {
      phoneNumber += Math.floor(Math.random() * 2) + 6;
    } else {
      phoneNumber += Math.floor(Math.random() * 10);
    }
  }
  return phoneNumber;
}
