from rest_framework.response import Response
from rest_framework import views
from rest_framework import status

# using to implements register and login logic
from conf.firebase import auth

# using to update some parameters of the user
from firebase_admin import auth as auth_admin

# local imports
from .models import create_user, create_role
from .utils import validate_login, get_user_role_by_email, register_user


class CreateUsersAdminView(views.APIView):
    def post(self, request):
        id_token = request.META.get('HTTP_AUTHORIZATION')

        if not id_token:
            return Response({'message': 'Token is missing'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            decoded_token = auth_admin.verify_id_token(id_token)

            role = get_user_role_by_email(decoded_token['email'])

            if role != 'admin':
                return Response({'message': 'Only admins can create users'}, status=status.HTTP_403_FORBIDDEN)

            role_id = create_role(request.data['rol'])
            create_user(request.data, role_id)
            register_user(request.data)

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
            register_user(request.data)
            return Response(data={'message': 'user created successfully!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    def post(self, request):
        try:
            validate_login(request.data)
            user = auth.sign_in_with_email_and_password(
                request.data['email'], request.data['password'])
            role = get_user_role_by_email(request.data['email'])
            return Response(data={'user': user, 'role': role}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
