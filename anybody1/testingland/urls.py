from django.urls import path
from django.conf.urls import url
from . import views

urlpatterns = [
    # path('ajax/', views.ajax.as_view(), name='ajax'),
    # url('ajax/validate_username/$', views.validate_username, name='validate_username'),
    # path('extra/', views.extra, name='extra'),
    # path('hector/', views.hector.as_view(), name='hector'),
    # url('hector/$', views.get_cafes, name='get_cafes'),
    # path('get_cafes/', views.get_cafes.as_view(), name='get_cafes'),
    # url('hector/get_cafes/$', views.get_cafes, name='get_cafes'),
    #path('location', views.location, name='location'),
    path('cafe_list/', views.cafes_home, name='cafes_home'),
    url('electra/cafe_list/', views.cafe_list.as_view(), name='cafe_list'),
]
