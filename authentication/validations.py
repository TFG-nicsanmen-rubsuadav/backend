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


def validate_regex(data: str, regex: str, error: str):
    if not re.match(regex, data):
        raise ValueError(error)


def validate_length(data: str, error: str):
    if len(data) < 3:
        raise ValueError(error)


def validate_birth_date(birth_date: str):
    try:
        datetime.strptime(birth_date, '%d/%m/%Y')
    except ValueError:
        raise ValueError(BIRTH_DATE_FORMAT)


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


## MAIN VALIDATIONS ##
def validate_user_creation(user: dict, is_create: bool):
    if "email" in user or is_create:
        validate_unique_email(user["email"])
        validate_regex(user["email"], EMAIL_REGEX, WRONG_EMAIL)
    if "phone" in user or is_create:
        validate_unique_phone(user["phone"])
        validate_regex(user["phone"], PHONE_REGEX, PHONE_MALFORMED)
    if "name" in user or is_create:
        validate_length(user["name"], NAME_LENGTH)
    if "last_name" in user or is_create:
        validate_length(user["last_name"], LAST_NAME_LENGTH)
    if "birth_date" in user or is_create:
        validate_birth_date(user["birth_date"])
    if "password" in user or is_create:
        check_password(user["password"])


def validate_login(data: dict):
    if not re.match(EMAIL_REGEX, data["email"]):
        raise ValueError(WRONG_EMAIL)

    check_password(data["password"])
