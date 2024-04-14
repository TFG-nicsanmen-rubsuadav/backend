from rest_framework.response import Response
from rest_framework import views
from rest_framework import status

# using to implements register and login logic
from conf.firebase import auth, firestore
from google.cloud.firestore import FieldFilter

# using to update some parameters of the user
from firebase_admin import auth as auth_admin

# local imports
from .models import create_user, create_role
from .utils import validate_login


# TODO: Cuando estén creados los roles, a este método solo puede llamar un administrador
# el resto de usuarios se crean con el authentication de Firebase
class CreateUsersAdminView(views.APIView):
    def post(self, request):
        try:
            role_id = create_role(request.data['rol'])
            create_user(request.data, role_id)
            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(views.APIView):
    def post(self, request):
        try:
            # TODO: Puede ser customer o owner, dependiendo de que si ese usuario paga o no, si paga, será owner, si no, customer (implementar lógica de pago)
            role_id = create_role('customer')
            request.data["rol"] = 'customer'

            create_user(request.data, role_id)
            user = auth.create_user_with_email_and_password(
                request.data['email'], request.data['password'])

            auth.update_profile(
                user['idToken'], display_name=request.data['name'] + ' ' + request.data['last_name'])
            auth_admin.update_user(
                user["localId"], phone_number='+34' + request.data['phone'])
            return Response(data={'message': 'user created successfully!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    def post(self, request):
        try:
            validate_login(request.data)
            user = auth.sign_in_with_email_and_password(
                request.data['email'], request.data['password'])
            firestore_user = firestore.collection(
                'users').where(filter=FieldFilter(
                    'email', '==', request.data['email'])).get()[0]
            role = firestore_user.reference.collection(
                'role').get()[0].to_dict()['name']
            return Response(data={'user': user, 'role': role}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
