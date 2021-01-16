from django.urls import path
from django.contrib import auth
from django.conf.urls import url
from django.contrib.auth.views import LoginView, LogoutView
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('', views.cafes_home, name='cafes_home'),
    path('index2', views.index_2, name='cafes_home'),
    url('electra/cafe_list/', views.cafe_list.as_view(), name='cafe_list'),
    url('electra/marker_info/', views.marker_info, name='marker_info'),
    url('electra/info_box/', views.info_box, name='info_box'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('electra/playlist', views.user_playlist.as_view(), name='user_playlist'),

    #auth
    path('signup', views.SignUp.as_view(), name='signup'),
    path('login', auth.views.LoginView.as_view(), name='login'),
    path('logout', auth.views.LogoutView.as_view(), name='logout'),

    #placelist
    path('newlist', views.NewList.as_view(), name='create_list'),
    path('<int:pk>', views.DetailList.as_view(), name='detail_list'),
    path('<int:pk>/update', views.UpdateList.as_view(), name='update_list'),
    path('<int:pk>/delete', views.DeleteList.as_view(), name='delete_list'),
    #url('electra/playlist/', csrf_exempt(views.user_playlist.as_view()), name='user_list'),

    #place

]
