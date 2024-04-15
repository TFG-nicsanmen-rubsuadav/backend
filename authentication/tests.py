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
from local_settings import EMAIL, PASSWORD


def create_valid_user():
    fetch = requests.get('https://randomuser.me/api/')

    mail = fetch.json()['results'][0]['email'].replace('example', 'gmail')
    password = fetch.json()['results'][0]['login']['password']
    punctuation = string.punctuation.replace("'", "")
    password += secrets.choice(punctuation)
    password += secrets.choice(string.ascii_uppercase)
    password += secrets.choice(string.digits)
    name = fetch.json()['results'][0]['name']['first']
    last_name = fetch.json()['results'][0]['name']['last']
    phone_number = generate_phone_number()

    return name, last_name, mail, phone_number, password


class BaseTest(APITestCase):
    def get_token_admin(self):
        response = self.client.post('/auth/login/', data=json.dumps({
            "email": EMAIL,
            "password": PASSWORD
        }), content_type='application/json')
        return response.data['user']['idToken']

    def post_data(self, data: dict, expected_status: int, expected_message: str, token: str = None):
        headers = {'Authorization': token} if token else {'Authorization': ''}
        response = self.client.post(
            '/auth/create/', json.dumps(data), content_type='application/json', headers=headers)
        self.assertEqual(response.status_code, expected_status)
        self.assertEqual(response.data["message"], expected_message)


class CreateUsersAdminTest(BaseTest):
    @ parameterized.expand(get_test_data(status.HTTP_400_BAD_REQUEST))
    def test_invalid_data(self, _, data: dict, expected_status: int, expected_message: str):
        self.post_data(data, expected_status, expected_message,
                       self.get_token_admin())

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
                       "User created successfully", self.get_token_admin())

    def test_invalid_token(self):
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

        self.post_data(data, status.HTTP_401_UNAUTHORIZED,
                       "Token is missing", None)


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


class LoginViewTest(APITestCase):
    def login_data(self, data: dict, expected_status: int):
        response = self.client.post(
            '/auth/login/', json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, expected_status)
        return response

    def test_invalid_login(self):
        self.login_data({"email": "xfsfdhg@gmail.com",
                         "password": "password"}, status.HTTP_400_BAD_REQUEST)

    def test_valid_login(self):
        name, last_name, mail, phone_number, password = create_valid_user()
        data = {
            "name": name,
            "last_name": last_name,
            "email": mail,
            "phone": phone_number,
            "birth_date": "12/10/2019",
            "password": password,
        }
        self.client.post(
            '/auth/register/', json.dumps(data), content_type='application/json')

        response = self.login_data({"email": mail, "password": password},
                                   status.HTTP_200_OK)

        headers = {'Authorization': response.data['user']['idToken']}
        response2 = self.client.post(
            '/auth/create/', json.dumps(data), content_type='application/json', headers=headers)
        self.assertEqual(response2.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response2.data["message"],
                         "Only admins can create users")


class UserProfileViewTest(APITestCase):
    def test_valid_user_profile(self):
        response = self.client.get('/auth/profile/os1x1t7QpyKf00aa8NR9/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_user_profile(self):
        response = self.client.get('/auth/profile/invalid_id/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["message"], "User not found")
