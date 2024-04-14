import secrets
import hashlib
from google.cloud.firestore import FieldFilter
from rest_framework import status
from rest_framework.response import Response


# local imports
from .constants import (
    EMAIL_ALREADY_IN_USE,
    PASSWORD_SPECIAL_CHAR,
    WRONG_EMAIL, NAME_LENGTH,
    LAST_NAME_LENGTH, PHONE_MALFORMED,
    BIRTH_DATE_FORMAT, PASSWORD_LENGTH,
    PASSWORD_LOWERCASE,
    PASSWORD_UPPERCASE,
    PASSWORD_DIGIT,
    ROLES, ROLE_NOT_ALLOWED,
)
from conf.firebase import firestore

# using to implements register and login logic
from conf.firebase import auth

# using to update some parameters of the user
from firebase_admin import auth as auth_admin


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


def check_permmisions(id_token: str):
    decoded_token = auth_admin.verify_id_token(
        id_token, clock_skew_seconds=60)

    role = get_user_role_by_email(decoded_token['email'])

    if role != 'admin':
        return Response({'message': 'Only admins can create users'}, status=status.HTTP_403_FORBIDDEN)


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
