export function validate({
  name,
  lastName,
  email,
  password,
  phone,
  birthDate,
}) {
  const errors = {};

  switch (true) {
    case !name:
      errors.nameError = "El nombre es requerido";
      break;
    case name.length < 2:
      errors.nameError = "El nombre debe tener al menos 3 caracteres";
      break;
    case !lastName:
      errors.lastNameError = "El apellido es requerido";
      break;
    case lastName.length < 2:
      errors.lastNameError = "El apellido debe tener al menos 3 caracteres";
      break;
    case !email:
      errors.emailError = "El correo electrónico es requerido";
      break;
    case !/^\w+([.-]?\w+)*@(gmail|hotmail|outlook)\.com$/.test(email):
      errors.emailError = "El correo electrónico es inválido";
      break;
    case !password:
      errors.passwordError = "La contraseña es requerida";
      break;
    case password.length < 6:
      errors.passwordError = "La contraseña debe tener al menos 6 caracteres";
      break;
    case !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password):
      errors.passwordError =
        "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un caracter especial";
      break;
    case !phone:
      errors.phoneError = "El teléfono es requerido";
      break;
    case !/^(\\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}$/.test(phone):
      errors.phoneError = "El teléfono es inválido";
      break;
    case !birthDate:
      errors.birthDateError = "La fecha de nacimiento es requerida";
      break;
    case new Date(birthDate) > new Date():
      errors.birthDateError = "La fecha de nacimiento es inválida";
      break;
    case !/^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/]\d{4}$/.test(birthDate):
      errors.birthDateError = "La fecha de nacimiento es inválida";
      break;
    default:
      break;
  }
  return errors;
}
