from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import generics, permissions, mixins, status
from .serializers import VenueListSerializer, TestVenueSerializer, UserListSerializer, UserVenueSerializer
from testingland.models import Venues, VenueList, UserVenue, UserList
from django.urls import reverse_lazy
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
import pdb


#this is a place where user can make a list (can also be done form the template)
class UserVenueViewSet(viewsets.ModelViewSet):
    serializer_class = UserVenueSerializer
    context_object_name = 'playlist'
    #@ensure_csrf_cookie

    def list(self, request):
        serializer = UserVenueSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def get_queryset(self):
        return UserVenue.objects.filter(list__user=self.request.user)


#this shows all lists for a user
class UserListViewSet(viewsets.ModelViewSet):
    serializer_class = UserListSerializer
    def get_queryset(self):
        return UserList.objects.filter(user=self.request.user)



class AddVenueList(generics.ListAPIView):
    serializer_class = VenueListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return VenueList.objects.filter(user=user)

class CreateVenueList(generics.ListCreateAPIView):
    serializer_class = VenueListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return VenueList.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TestVenueList(generics.ListAPIView):
    serializer_class = TestVenueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        cafeName = self.request.GET.get('cafeName')
        user = self.request.user
        print(cafe)
        return cafeName

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
