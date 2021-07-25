from django.urls import path
from django.contrib import auth
from django.conf.urls import url
from django.contrib.auth.views import LoginView, LogoutView
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('', views.cafes_home, name='cafes_home'),
    # path('', views.index_2, name='cafes_home'),
    path('campaign', views.campaign_page, name='campaign'),
    path('venue/<int:venue_id>/', views.venue_page, name='venue_page'),
    # url('electra/cafe_list/', views.cafe_list.as_view(), name='cafe_list'),
    url('electra/update_list_name/', views.update_list_name, name='/electra/update_list_name/'),
    url('electra/marker_info/', views.marker_info, name='marker_info'),
    url('electra/get_friends', views.get_friends, name='get_friends'),
    url('electra/info_box/', views.info_box, name='info_box'),
    url('electra/new_marker/', views.new_marker, name='new_marker'),
    url('electra/broadsheet_scraper/', views.broadsheet_scraper, name='broadsheet_scraper'),
    url('electra/get_cafe/', views.get_cafe, name='get_cafe'),
    url('electra/get_cafe_without_image/', views.get_cafe_without_image, name='get_cafe_without_image'),
    url('electra/get_cafe_image/', views.get_cafe_image, name='get_cafe_image'),
    url('electra/get_searched_image/', views.get_searched_image, name='get_searched_image'),
    url('electra/search/', views.search, name='search'),
    url('electra/filter/', views.venue_filter, name='filter'),
    url('electra/get_searched_venue_details/', views.get_searched_venue_details, name='get_searched_venue_details'),
    url('electra/place_search/', views.place_search, name='place_search'),
    url('add_cafe', views.add_cafe, name='add_cafe'), 
    url('electra/liked/', views.like_venue, name='like_venue'), 
    url('update_cafe', views.update_cafe, name='update_cafe'), 
    url('add_image', views.add_image, name='add_image'), 
    url('add_broadsheet', views.add_broadsheet, name='add_broadsheet'), 
    path('profile', views.profile, name='profile'),
    path('users', views.users, name='users'),
    path('connections', views.connections, name='connections'),
    path('electra/remove_venue_from_list/', views.remove_venue_from_list, name='remove_venue_from_list'),
    path('electra/remove_venue_from_liked/', views.remove_venue_from_liked, name='remove_venue_from_liked'),

    url('electra/get_users/', views.get_users, name='get_users'),
    path('electra/getUserMarkers/', views.getUserMarkers, name='getUserMarkers'),

    #testing
    url('electra/feedback/', views.user_feedback, name='feedback'),
    url('electra/suggestion/', views.user_suggestion, name='suggestion'),

    #auth
    path('signup', views.SignUp.as_view(), name='signup'),
    path('login', auth.views.LoginView.as_view(), name='login'),
    path('logout', auth.views.LogoutView.as_view(), name='logout'),

    #placelist
    path('write_description', views.write_description, name='write_description'),
    path('write_image', views.write_image, name='write_image'),
    path('broadsheet', views.broadsheet, name='broadsheet'),
    # path('<int:pk>', views.DetailList.as_view(), name='detail_list'),
    # path('<int:pk>/update', views.UpdateList.as_view(), name='update_list'),
    # path('<int:pk>/delete', views.DeleteList.as_view(), name='delete_list'),
    path('<username>', views.view_dashboard, name='view_dashboard'),
]
