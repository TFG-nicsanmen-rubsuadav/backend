from datetime import datetime
import re
import secrets
import hashlib
from google.cloud.firestore import FieldFilter


# local imports
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
    ROLES, ROLE_NOT_ALLOWED,
    EMAIL_REGEX, PHONE_REGEX
)
from conf.firebase import firestore

# using to implements register and login logic
from conf.firebase import auth

# using to update some parameters of the user
from firebase_admin import auth as auth_admin


# VALIDATION METHODS #####################################
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


# UTILS METHODS ##########################################
def get_allowed_roles(role: str):
    if role not in ROLES:
        raise ValueError(ROLE_NOT_ALLOWED)


def check_roles(rol: str) -> str | bool:
    roles = firestore.collection("roles").stream()
    for r in roles:
        if r.to_dict()["name"] == rol:
            return r.id
    return False


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode(encoding="utf-8")).hexdigest()


def get_user_role_by_email(email: str) -> str:
    firestore_user = firestore.collection(
        'users').where(filter=FieldFilter(
            'email', '==', email)).get()[0]
    return firestore_user.reference.collection(
        'role').get()[0].to_dict()['name']


def register_user(data: dict):
    user = auth.create_user_with_email_and_password(
        data['email'], data['password'])

    auth.update_profile(
        user['idToken'], display_name=data['name'] + ' ' + data['last_name'])
    auth_admin.update_user(
        user["localId"], phone_number='+34' + data['phone'])


# TESTS UTILS METHODS #####################################
def generate_phone_number():
    phone_number = ''
    for i in range(9):
        if i == 0:
            phone_number += str(secrets.choice([6, 7]))
        else:
            phone_number += str(secrets.randbelow(10))
    return phone_number


def create_test_case_invalid_role(status):
    return {"name": "test_invalid_role",
            "data": {"rol": "autcdhorizated"}, "status": status, "result": ROLE_NOT_ALLOWED}


def create_test_case_invalid_email_unique_email(status):
    return {"name": "test_invalid_email_unique_email",
            "data": {"email": "rsuarezdavid@gmail.com", "phone": "699383767", "rol": "admin"},
            "status": status, "result": EMAIL_ALREADY_IN_USE}


def create_test_case_invalid_email(status):
    return {"name": "test_invalid_email",
            "data": {"email": "HSJHDSJH", "phone": "727784361", "rol": "owner"},
            "status": status, "result": WRONG_EMAIL}


def create_test_case_invalid_name(status):
    return {"name": "test_invalid_name",
            "data": {"name": "te", "email": "HSJHDSJH@gmail.com", "phone": "727784361", "rol": "owner"},
            "status": status, "result": NAME_LENGTH}


def create_test_case_invalid_last_name(status):
    return {"name": "test_invalid_last_name",
            "data": {"last_name": "te", "email": "HSJHDSJH@gmail.com", "phone": "727784361", "rol": "owner"},
            "status": status, "result": LAST_NAME_LENGTH}


def create_test_case_invalid_phone(status):
    return {"name": "test_invalid_phone",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "fg", "rol": "owner"},
            "status": status, "result": PHONE_MALFORMED}


def create_test_case_invalid_birth_date(status):
    return {"name": "test_invalid_birth_date",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "dvfvtgfbv", "rol": "owner"},
            "status": status, "result": BIRTH_DATE_FORMAT}


def create_test_case_invalid_password_length(status):
    return {"name": "test_invalid_password_length",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "12/10/2019", "password": "ff", "rol": "customer"},
            "status": status, "result": PASSWORD_LENGTH}


def create_test_case_invalid_password_lowercase(status):
    return {"name": "test_invalid_password_lowercase",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "12/10/2019", "password": "111111111111", "rol": "customer"},
            "status": status, "result": PASSWORD_LOWERCASE}


def create_test_case_invalid_password_uppercase(status):
    return {"name": "test_invalid_password_uppercase",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "12/10/2019", "password": "111111111111f", "rol": "customer"},
            "status": status, "result": PASSWORD_UPPERCASE}


def create_test_case_invalid_password_digit(status):
    return {"name": "test_invalid_password_digit",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "12/10/2019", "password": "fFfFDhshdfF", "rol": "admin"},
            "status": status, "result": PASSWORD_DIGIT}


def create_test_case_invalid_password_special_char(status):
    return {"name": "test_invalid_password_special_char",
            "data": {"email": "HSJHDSJH@gmail.com", "phone": "699332667", "birth_date": "12/10/2019", "password": "111111111111fF", "rol": "admin"},
            "status": status, "result": PASSWORD_SPECIAL_CHAR}


def create_tests_cases(status: int):
    return [
        create_test_case_invalid_role(status),
        create_test_case_invalid_email_unique_email(status),
        create_test_case_invalid_email(status),
        create_test_case_invalid_name(status),
        create_test_case_invalid_last_name(status),
        create_test_case_invalid_phone(status),
        create_test_case_invalid_birth_date(status),
        create_test_case_invalid_password_length(status),
        create_test_case_invalid_password_lowercase(status),
        create_test_case_invalid_password_uppercase(status),
        create_test_case_invalid_password_digit(status),
        create_test_case_invalid_password_special_char(status),
    ]


def get_test_data(status: int):
    common_data = {
        "name": "test",
        "last_name": "test",
        "birth_date": "10/07/1998",
        "password": "@Password1",
    }

    return [(case["name"], {**common_data, **case["data"]}, case["status"], case["result"]) for case in create_tests_cases(status)]
