from django.urls import path
from . import views

urlpatterns = [
    path('dashboard', views.dashboard, name='dashboard'),
    path('dashboard/', views.dashboard, name='dashboard_with_slash'),
]