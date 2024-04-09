from rest_framework.test import APITestCase
from rest_framework import status
from parameterized import parameterized
# external imports
import json
import requests
import string
import secrets

# local imports
from .utils import get_test_data, generate_phone_number
from .constants import EMAIL_ALREADY_IN_USE, PHONE_ALREADY_IN_USE


def create_valid_user():
    fetch = requests.get('https://randomuser.me/api/')

    mail = fetch.json()['results'][0]['email'].replace('example', 'gmail')
    password = fetch.json()['results'][0]['login']['password']
    password += secrets.choice(string.punctuation)
    password += secrets.choice(string.ascii_uppercase)
    password += secrets.choice(string.digits)
    name = fetch.json()['results'][0]['name']['first']
    last_name = fetch.json()['results'][0]['name']['last']
    phone_number = generate_phone_number()

    return name, last_name, mail, phone_number, password


class CreateUsersAdminTest(APITestCase):
    def post_data(self, data: dict, expected_status: int, expected_message: str):
        response = self.client.post(
            '/auth/create/', json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, expected_status)
        self.assertEqual(response.data["message"], expected_message)

    @parameterized.expand(get_test_data(status.HTTP_400_BAD_REQUEST))
    def test_invalid_data(self, _, data: dict, expected_status: int, expected_message: str):
        self.post_data(data, expected_status, expected_message)

    def test_valid_user_creation(self):
        name, last_name, mail, phone_number, password = create_valid_user()
        data = {
            "name": name,
            "last_name": last_name,
            "email": mail,
            "phone": phone_number,
            "birth_date": "12/10/2019",
            "password": password,
            "rol": "customer"
        }

        self.post_data(data, status.HTTP_201_CREATED,
                       "User created successfully")


class RegisterViewTest(APITestCase):
    def register_data(self, data: dict, expected_status: int, expected_message: str):
        response = self.client.post(
            '/auth/register/', json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, expected_status)
        self.assertEqual(response.data["message"], expected_message)

    def test_invalid_register_email_already_use(self):
        name, last_name, _, phone_number, password = create_valid_user()
        self.register_data({
            "name": name,
            "last_name": last_name,
            "email": "rsuarezdavid@gmail.com",
            "phone": phone_number,
            "birth_date": "12/10/2019",
            "password": password,
        }, status.HTTP_400_BAD_REQUEST, EMAIL_ALREADY_IN_USE)

    def test_invalid_register_phone_already_use(self):
        name, last_name, mail, _, password = create_valid_user()
        self.register_data({
            "name": name,
            "last_name": last_name,
            "email": mail,
            "phone": "628074495",
            "birth_date": "12/10/2019",
            "password": password,
        }, status.HTTP_400_BAD_REQUEST, PHONE_ALREADY_IN_USE)

    def test_valid_register(self):
        name, last_name, mail, phone_number, password = create_valid_user()
        self.register_data({
            "name": name,
            "last_name": last_name,
            "email": mail,
            "phone": phone_number,
            "birth_date": "12/10/2019",
            "password": password,
        }, status.HTTP_201_CREATED, "user created successfully!")
