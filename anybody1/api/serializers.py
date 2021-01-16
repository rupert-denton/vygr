from rest_framework import serializers
from testingland.models import VenueList, Venues, UserList, UserVenue

class UserVenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserVenue
        fields = ['id', 'list', 'venue']

class UserListSerializer(serializers.ModelSerializer): #this is what we worked on on October 1
    class Meta:
        model = UserList
        fields = ['id', 'user', 'list_name']

class VenueListSerializer(serializers.ModelSerializer):
    created = serializers.ReadOnlyField()

    class Meta:
        model = VenueList
        fields = ['id', 'title']

class TestVenueSerializer(serializers.ModelSerializer):
    created = serializers.ReadOnlyField()

    class Meta:
        model = Venues
        fields = ['venue_name', 'venue_address', 'venue_long', 'venue_lat']
