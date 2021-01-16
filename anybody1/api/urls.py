from rest_framework.routers import DefaultRouter

from django.urls import path
from . import views

router = DefaultRouter() #need help understanding router register
router.register('userlist', views.UserListViewSet, basename= 'userlist')
router.register('uservenue', views.UserVenueViewSet, basename= 'uservenue')
#router.register('userplaylist', views.UserPlaylistViewSet, basename= 'userplaylist')


urlpatterns = router.urls;

urlpatterns += [
    #path('makelist', views.NewList.as_view()),
    path('venues/added', views.AddVenueList.as_view()),
    path('venues/create', views.CreateVenueList.as_view()),
    path('venues/test', views.TestVenueList.as_view()),

    #path('venues/uservenue', views.UserVenue.as_view()),
]
