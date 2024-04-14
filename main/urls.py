from django.urls import path

# local imports
from . import views

urlpatterns = [
    path('scrapping/', views.index, name='index'),
]
