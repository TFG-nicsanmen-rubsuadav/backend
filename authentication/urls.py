from django.urls import path

# local imports
from .views import (
    CreateUsersAdminView, EditUserProfileAdminView,
    RegisterView, LoginView,
    UserProfileView,
)

urlpatterns = [
    path('create/', CreateUsersAdminView.as_view()),
    path('edit-user/<str:user_id>/', EditUserProfileAdminView.as_view()),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('profile/<str:user_id>/', UserProfileView.as_view())
]
