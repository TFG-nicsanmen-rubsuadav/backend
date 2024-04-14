from django.urls import path

# local imports
from .views import CreateUsersAdminView, RegisterView, LoginView

urlpatterns = [
    path('create/', CreateUsersAdminView.as_view()),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view())
]
