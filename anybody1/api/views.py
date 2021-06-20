from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import generics, permissions, mixins, status
from .serializers import VenueListSerializer, UserListSerializer, UserVenueSerializer, UserConnectionSerializer
from .serializers import UserConnectionListSerializer, UserInfoSerializer, CreateUserListSerializer, PromotionSerializer
from .serializers import VenueCommentSerializer, ReplyCommentSerializer
from api import serializers
from testingland.models import Venues, VenueList, UserVenue, UserList, UserConnections, User, PromotionCampaign, mapCafes, VenueComments
from django.urls import reverse_lazy
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, JsonResponse, Http404
from django.contrib.gis.geos import fromstr, Point, Polygon
from django.contrib.gis.db.models.functions import Distance, Envelope
from rest_framework.authentication import SessionAuthentication

import pdb
import requests
from requests import get


class CsrfExemptSession(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class UserVenueViewSet(viewsets.ModelViewSet):
    serializer_class = UserVenueSerializer

    def get_queryset(self):
        return UserVenue.objects.filter(user_list__user=self.request.user)

    def create(self, request):
        if self.request.method == "POST":

            serializer = CreateUserListSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
            
                return Response({'status' : 'ok'}, status=200)
    
            else:
                return Response({'error' : serializer.errors}, status=400)
                
#this shows all lists for a user
class UserListViewSet(viewsets.ModelViewSet):
    serializer_class = UserListSerializer
 
    def get_queryset(self):
        return UserList.objects.filter(user__username=self.request.user).order_by('-pk')
    
    def create(self, request):
        serializer_class = UserListSerializer

        if self.request.method == "POST":
            user = self.request.user.id
            list_name = request.data.get('list_name')
            print(user)
            data = {'user': user, 'list_name': list_name}
            serializer = serializer_class(data=data)
            
            if serializer.is_valid():
                instance = serializer.save()
            
                return Response({'status' : 'ok', 'user' : user, 'instance_id':instance.id}, status=200)
    
            else:
                return Response({'error' : serializer.errors}, status=400)

class UpdateUserListViewSet(viewsets.ModelViewSet):
        serializer_class = UserListSerializer
        queryset = UserList.objects.all()

        def update(self, instance, validated_data):
            serializer_class = UserListSerializer

            if self.request.method == "POST":
                list_id = request.data.get('id')
                user = self.request.user
                print(user)
                list_name = request.data.get('list_name')
                print(list_name)
                data = {'user': user, 'list_name': list_name}
                serializer = serializer_class(data=data, partial=True)
                
                if serializer.is_valid():
                    serializer.save()

                    return Response({'status' : 'ok'}, status=200)
        
                else:
                    return Response({'error' : serializer.errors}, status=400)

class DeleteListViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserListSerializer
    authentication_classes = [CsrfExemptSession]
    def get_queryset(self):
        return UserList.objects.filter(user__username=self.request.user).order_by('-pk')


class RemoveVenueViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserVenueSerializer
    authentication_classes = [CsrfExemptSession]
    def get_queryset(self):
        user_list = self.request.GET.get('user_list', None)
        venue = self.request.GET.get('venue', None)
        print(user_list, venue)
        data = UserVenue.objects.filter(user_list = user_list, venue = venue)
        print(data)
        return data.delete()

class SavedVenuesViewSet(viewsets.ModelViewSet):
    serializer_class = UserVenueSerializer
    
    def get_queryset(self):
        list_id = self.request.GET.get('list_id', None)
        print(list_id)
        print(type(list_id))
        return UserVenue.objects.filter(user_list=int(float(list_id)))

class CurrentUserInfoViewSet(viewsets.ModelViewSet):
    serializer_class = UserInfoSerializer

    def get_queryset(self):
        current_user = self.request.GET.get('current_user', None)
        current_user_qs = User.objects.filter(username=current_user)
        return current_user_qs

class FollowedUserInfoViewSet(viewsets.ModelViewSet):
    serializer_class = UserInfoSerializer

    def get_queryset(self):
        followed_user = self.request.GET.get('followed_user', None)
        followed_user_qs = User.objects.filter(username=followed_user)
        return followed_user_qs

class PrepareUserInfoViewSet(viewsets.ModelViewSet):
    serializer_class = UserInfoSerializer

    def get_queryset(self):
        follower = self.request.GET.get('follower', None)
        followed = self.request.GET.get('followed', None)

        follower_qs = User.objects.get(username=follower)
        followed_qs = User.objects.get(username=followed)
        qs = (follower_qs, followed_qs)
        return qs

class UserConnectionsViewSet(viewsets.ModelViewSet):
    serializer_class = UserConnectionListSerializer
    queryset = UserConnections.objects.all()

    def create(self, request):
        serializer_class = UserConnectionListSerializer

        if self.request.method == "POST":
            follower = request.data.get('follower_id')
            followed = request.data.get('followed_id')
            data = {'follower':follower , 'followed':followed }
            serializer = serializer_class(data=data)
            if serializer.is_valid():
                serializer.save()
            
            return Response(data) 


# gets list of who logged in user is following
class FollowingViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserConnectionListSerializer
    queryset = UserConnections.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return serializers.UserConnectionSerializer

        return self.serializer_class

    def get_queryset(self):
        user_id = self.request.GET.get('current_user_id', None)
        print(user_id)
        return UserConnections.objects.filter(follower__id=user_id)


# gets list of followers who follow logged-in user
class FollowerViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserConnectionListSerializer
    queryset = UserConnections.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return serializers.UserConnectionSerializer

        return self.serializer_class

    def get_queryset(self):
        user_id = self.request.GET.get('current_user_id', None)
        print(user_id)
        return UserConnections.objects.filter(followed__id=user_id)

#unfollow (delete connection)
class DeleteConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.UserConnectionListSerializer
    queryset = UserConnections.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return serializers.UserConnectionSerializer

        return self.serializer_class

    def get_queryset(self):
        user_id = self.request.GET.get('follower', None)
        followed_user_id = self.request.GET.get('followed', None)
        connection = UserConnections.objects.filter(follower__id=user_id, followed__id=followed_user_id)
        return connection.delete()


class PromotionViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PromotionSerializer

    def get_queryset(self):
        neLat = self.request.GET.get('neLat', None)
        neLng = self.request.GET.get('neLng', None)
        swLat = self.request.GET.get('swLat', None)
        swLng = self.request.GET.get('swLng', None)
        ne = (neLat, neLng)
        sw = (swLat, swLng)

        xmin = float(sw[1])
        ymin = float(sw[0])
        xmax = float(ne[1])
        ymax = float(ne[0])
        bbox = (xmin, ymin, xmax, ymax)
        print(bbox)

        geom = Polygon.from_bbox(bbox)

        qs = promotionCampaign.objects.filter(promo_venue__geolocation__coveredby=geom)

        return qs

    def create(self, request):
        if self.request.method == "POST":

            serializer = promotionSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
            
                return Response({'status' : 'ok'}, status=200)
    
            else:
                return Response({'error' : serializer.errors}, status=400)


class VenueCommentViewSet(viewsets.ModelViewSet):
    serializer_class = VenueCommentSerializer

    def get_queryset(self):
        venue = self.request.GET.get('venue', None)
        return VenueComments.objects.all()

    def create(self, request):
        if self.request.method == "POST":
            venue = request.data.get('venue_id')
            # user = self.request.user.id
            comment = request.data.get('comment')
            data = {'comment':comment, 'venue_id':venue }

            print(data)
            print(type(data))

            serializer = VenueCommentSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
            
                return Response({'status' : 'ok'}, status=200)
    
            else:
                return Response({'error' : serializer.errors}, status=400)