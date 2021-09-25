from rest_framework.routers import DefaultRouter

from django.urls import path
from . import views

router = DefaultRouter() #need help understanding router register

# venues and lists features
router.register('userlist', views.UserListViewSet, basename= 'userlist')
router.register('otheruserlist', views.OtherUserListVenueViewSet, basename= 'otherUserList')

router.register('userlistvenue', views.UserListVenueViewSet, basename= 'userlistvenue')
router.register('savedvenues', views.SavedVenuesViewSet, basename= 'savedvenues')
router.register('allbookmarkedvenues', views.AllBookMarkedVenuesViewSet, basename= 'allbookmarkedvenues')
router.register('liked', views.UserLikedViewSet, basename= 'liked')

router.register('deletelist', views.DeleteListViewSet, basename= 'deletelist')
router.register('removevenue', views.RemoveVenueViewSet, basename= 'removevenue')

router.register('updatelist', views.UpdateUserListViewSet, basename= 'updatelist')

# social features
router.register('userconnections', views.UserConnectionsViewSet, basename= 'userconnections')
router.register('prepareuserinfo', views.PrepareUserInfoViewSet, basename='prepareuserinfo')
router.register('currentuserinfo', views.CurrentUserInfoViewSet, basename='currentuserinfo')
router.register('followeduserinfo', views.FollowedUserInfoViewSet, basename='followeduserinfo')
router.register('following', views.FollowingViewSet, basename='following')
router.register('follower', views.FollowerViewSet, basename='follower')
router.register('deleteconnection', views.DeleteConnectionViewSet, basename='deleteconnection')


#comment features
router.register('venuecomments', views.VenueCommentViewSet, basename='venuecomments')

# enterprise

router.register('promotion', views.PromotionViewSet, basename= 'promotion')


urlpatterns = router.urls;

