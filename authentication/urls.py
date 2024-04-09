from django.urls import path

# local imports
from .views import CreateUsersAdminView, RegisterView

urlpatterns = [
    path('create/', CreateUsersAdminView.as_view()),
    path('register/', RegisterView.as_view())
]
