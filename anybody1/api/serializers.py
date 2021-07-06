from rest_framework import serializers
from testingland.models import VenueList, Venues, UserList, UserVenue, mapCafes, UserConnections, User, PromotionCampaign
from testingland.models import VenueComments, ReplyComments, liked

class mapCafesSerializer(serializers.ModelSerializer):
    class Meta:
        model = mapCafes
        fields = ['id', 'cafe_name', 'cafe_address', 'venue_type', 'description']

class CreateUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserVenue
        fields = ['user_list', 'venue']

class UserVenueSerializer(serializers.ModelSerializer):
    venue = mapCafesSerializer()
    
    class Meta:
        model = UserVenue
        fields = ['user_list', 'venue']
        depth = 2 

class AllBookMarkedSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueList
        fields = ['title', 'user', 'venue_name']

class UserListSerializer(serializers.ModelSerializer): #this is what we worked on on October 1
    class Meta:
        model = UserList
        fields = ['id', 'user', 'list_name']

class LikedSerializer(serializers.ModelSerializer):
    class Meta:
        model = liked
        fields = ['id', 'user', 'liked_venue']
        depth = 2 

class UserConnectionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserConnections
        fields = ['follower','followed']

class UserConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserConnections
        fields = '__all__'
        depth = 2


class UserInfoSerializer(serializers.ModelSerializer): #this is what we worked on on October 1
    class Meta:
        model = User
        fields = ['id', 'username']

class VenueListSerializer(serializers.ModelSerializer):
    created = serializers.ReadOnlyField()

    class Meta:
        model = VenueList
        fields = ['id', 'title']

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionCampaign
        fields = ['id', 'promo_venue', 'promo_title', 'promo_quantity']

class VenueCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueComments
        fields = ['venue', 'user', 'comment']
        depth = 2

class ReplyCommentSerializer(serializers.ModelSerializer):
    class Meta: 
        model = ReplyComments
        fields = ['id', 'user', 'original_comment', 'reply_comment']