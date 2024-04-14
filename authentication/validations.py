from datetime import datetime
import re

# local imports
from conf.firebase import firestore
from .constants import (
    EMAIL_ALREADY_IN_USE,
    PASSWORD_SPECIAL_CHAR,
    PHONE_ALREADY_IN_USE,
    WRONG_EMAIL, NAME_LENGTH,
    LAST_NAME_LENGTH, PHONE_MALFORMED,
    BIRTH_DATE_FORMAT, PASSWORD_LENGTH,
    PASSWORD_LOWERCASE,
    PASSWORD_UPPERCASE,
    PASSWORD_DIGIT,
    EMAIL_REGEX, PHONE_REGEX
)


def validate_unique_email(email: str):
    emails = firestore.collection("users").stream()
    for e in emails:
        if e.to_dict()["email"] == email:
            raise ValueError(EMAIL_ALREADY_IN_USE)


def validate_unique_phone(phone: str):
    phone = phone.replace(" ", "")
    phones = firestore.collection("users").stream()
    for p in phones:
        if p.to_dict()["phone"].replace(" ", "") == phone:
            raise ValueError(PHONE_ALREADY_IN_USE)


def validate_user_creation(user: dict):
    validate_unique_email(user["email"])
    validate_unique_phone(user["phone"])
    if not re.match(EMAIL_REGEX, user["email"]):
        raise ValueError(WRONG_EMAIL)

    if len(user["name"]) < 3:
        raise ValueError(NAME_LENGTH)

    if len(user['last_name']) < 3:
        raise ValueError(LAST_NAME_LENGTH)

    if not re.match(PHONE_REGEX, user['phone']):
        raise ValueError(PHONE_MALFORMED)

    try:
        datetime.strptime(user['birth_date'], '%d/%m/%Y')
    except ValueError:
        raise ValueError(BIRTH_DATE_FORMAT)

    check_password(user["password"])


def validate_login(data: dict):
    if not re.match(EMAIL_REGEX, data["email"]):
        raise ValueError(WRONG_EMAIL)

    check_password(data["password"])


def check_password(password: str):
    if len(password) < 8:
        raise ValueError(PASSWORD_LENGTH)
    if not re.search('[a-z]', password):
        raise ValueError(PASSWORD_LOWERCASE)
    if not re.search('[A-Z]', password):
        raise ValueError(PASSWORD_UPPERCASE)
    if not re.search('[0-9]', password):
        raise ValueError(PASSWORD_DIGIT)
    if not re.search('[!#$%&()*"+,-./:;<=>?@[\]^_`{|}~]', password):
        raise ValueError(PASSWORD_SPECIAL_CHAR)