from rest_framework.response import Response
from rest_framework import views
from rest_framework import status

# using to implements register and login logic
from conf.firebase import auth, firestore

# local imports
from .models import create_user, create_role
from .utils import get_user_role_by_email, register_user, check_permmisions
from .validations import validate_login, validate_user_creation


## ADMIN VIEWS ##########################################
class CreateUsersAdminView(views.APIView):
    def post(self, request):
        id_token = request.META.get('HTTP_AUTHORIZATION')

        if not id_token:
            return Response({'message': 'Token is missing'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            if (check_permmisions(id_token)):
                return check_permmisions(id_token)

            role_id = create_role(request.data['rol'])
            create_user(request.data, role_id)
            register_user(request.data)

            return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class EditUserProfileAdminView(views.APIView):
    def patch(self, request, user_id):
        id_token = request.META.get('HTTP_AUTHORIZATION')

        if not id_token:
            return Response({'message': 'Token is missing'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            if (check_permmisions(id_token)):
                return check_permmisions(id_token)

            validate_user_creation(request.data, False)

            user_ref = firestore.document('users', user_id)
            if not user_ref.get().exists:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            user_ref.update(request.data)
            return Response({'message': 'User profile updated successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


## USER VIEWS ##########################################
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


class UserProfileView(views.APIView):
    def get(self, request, user_id):
        user_ref = firestore.document('users', user_id)
        user_document = user_ref.get()
        if user_document.exists:
            user_data = user_document.to_dict()
            user_data.pop('password', None)

            role_document = user_ref.collection('role').get()[0]
            role = role_document.to_dict()['name']
            user_data['role'] = role
            return Response(data=user_data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
