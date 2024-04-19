export function validate(
  { name, lastName, email, password, phone, birthDate },
  isCreate
) {
  const errors = {};

  if (isCreate || name !== undefined) {
    if (!name) {
      errors.nameError = "El nombre es requerido";
    } else if (name.length < 2) {
      errors.nameError = "El nombre debe tener al menos 3 caracteres";
    }
  }

  if (isCreate || lastName !== undefined) {
    if (!lastName) {
      errors.lastNameError = "El apellido es requerido";
    } else if (lastName.length < 2) {
      errors.lastNameError = "El apellido debe tener al menos 3 caracteres";
    }
  }

  if (isCreate || email !== undefined) {
    if (!email) {
      errors.emailError = "El correo electrónico es requerido";
    } else if (!/^\w+([.-]?\w+)*@(gmail|hotmail|outlook)\.com$/.test(email)) {
      errors.emailError = "El correo electrónico es inválido";
    }
  }

  if (isCreate || password !== undefined) {
    if (!password) {
      errors.passwordError = "La contraseña es requerida";
    } else if (password.length < 6) {
      errors.passwordError = "La contraseña debe tener al menos 6 caracteres";
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      errors.passwordError =
        "La contraseña debe tener al menos una mayúscula, una minúscula, un número y un caracter especial";
    }
  }

  if (isCreate || phone !== undefined) {
    if (!phone) {
      errors.phoneError = "El teléfono es requerido";
    } else if (
      !/^(\\+34|0034|34)?[ -]*(6|7)[ -]*([0-9][ -]*){8}$/.test(phone)
    ) {
      errors.phoneError = "El teléfono es inválido";
    }
  }

  if (isCreate || birthDate !== undefined) {
    if (!birthDate) {
      errors.birthDateError = "La fecha de nacimiento es requerida";
    } else if (new Date(birthDate) > new Date()) {
      errors.birthDateError = "La fecha de nacimiento es inválida";
    } else if (
      !/^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/]\d{4}$/.test(birthDate)
    ) {
      errors.birthDateError = "La fecha de nacimiento es inválida";
    }
  }
  return errors;
}
