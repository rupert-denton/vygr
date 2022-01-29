from django.urls import path, re_path
from django.contrib import auth
from django.conf.urls import include
from django.contrib.auth.views import LoginView, LogoutView
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    path('', views.cafes_home, name='cafes_home'),
    
    # path('', views.index_2, name='cafes_home'),
    path('campaign', views.campaign_page, name='campaign'),
    path('venue/<int:venue_id>/', views.venue_page, name='venue_page'),
    # url('electra/cafe_list/', views.cafe_list.as_view(), name='cafe_list'),
    re_path('electra/update_list_name/', views.update_list_name, name='/electra/update_list_name/'),
    re_path('electra/marker_info/', views.marker_info, name='marker_info'),
    re_path('electra/get_friends', views.get_friends, name='get_friends'),
    re_path('electra/all_venues/', views.all_venues, name='all_venues'),
    re_path('electra/info_box/', views.info_box, name='info_box'),
    re_path('electra/new_marker/', views.new_marker, name='new_marker'),
    re_path('electra/broadsheet_scraper/', views.broadsheet_scraper, name='broadsheet_scraper'),
    re_path('electra/get_cafe/', views.get_cafe, name='get_cafe'),
    re_path('electra/get_cafe_without_image/', views.get_cafe_without_image, name='get_cafe_without_image'),
    re_path('electra/get_cafe_image/', views.get_cafe_image, name='get_cafe_image'),
    re_path('electra/get_searched_image/', views.get_searched_image, name='get_searched_image'),
    re_path('electra/search/', views.search, name='search'),
    re_path('electra/filter/', views.venue_filter, name='filter'),
    re_path('electra/get_searched_venue_details/', views.get_searched_venue_details, name='get_searched_venue_details'),
    re_path('electra/place_search/', views.place_search, name='place_search'),
    re_path('add_cafe', views.add_cafe, name='add_cafe'), 
    re_path('add_comment', views.add_venue_comment, name='add_venue_comment'), 
    re_path('electra/liked/', views.like_venue, name='like_venue'), 
    re_path('update_cafe', views.update_cafe, name='update_cafe'), 
    re_path('add_image', views.add_image, name='add_image'), 
    re_path('add_broadsheet', views.add_broadsheet, name='add_broadsheet'), 
    re_path('profile', views.profile, name='profile'),
    re_path('users', views.users, name='users'),
    re_path('connections', views.connections, name='connections'),
    re_path('electra/remove_venue_from_list/', views.remove_venue_from_list, name='remove_venue_from_list'),
    re_path('electra/remove_venue_from_liked/', views.remove_venue_from_liked, name='remove_venue_from_liked'),

    re_path('electra/get_users/', views.get_users, name='get_users'),
    re_path('electra/get_user_markers/', views.getUserMarkers, name='get_user_markers'),
    re_path('electra/getuserlists/', views.getUserlists, name='getUserlists'),
    re_path('electra/create_new_list/', views.create_new_list, name='create_new_list'),
    re_path('electra/otheruserlist/', views.otherUserList, name='otheruserlist'),
    re_path('electra/get_user_venues/', views.getUserVenues, name='get_user_venues'),
    re_path('electra/get_user_liked/', views.getUserLiked, name='get_user_venues'),
    re_path('login_page', views.login_page, name='login_page'),


    #testing
    re_path('electra/feedback/', views.user_feedback, name='feedback'),
    re_path('electra/suggestion/', views.user_suggestion, name='suggestion'),


    #placelist
    re_path('write_description', views.write_description, name='write_description'),
    re_path('write_image', views.write_image, name='write_image'),
    re_path('broadsheet', views.broadsheet, name='broadsheet'),

    path('electra/build_link/<int:pk>/', views.build_link, name='build_link'),
    path('electra/<uuid:uu>/', views.visit_link, name='visit_link'),
    path('electra/list/<uuid:uu>/', views.visit_list_link, name='visit_list_link'),
    path('electra/list/build_list_link/<int:pk>/', views.build_list_link, name='build_list_link'),

    re_path('<username>', views.view_dashboard, name='view_dashboard'),

]
