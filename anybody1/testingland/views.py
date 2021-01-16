from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, Http404
from django.template import loader
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login
from django.views.generic.edit import CreateView
from django.views import generic
from django.views.generic import ListView
from django.contrib.gis.geos import fromstr, Point
from django.contrib.gis.db.models.functions import Distance
from .models import mapCafes, listCafes, UserList, UserVenue, User
from django.urls import reverse_lazy
from .forms import PlaceForm, UserListForm
from django.views.decorators.csrf import ensure_csrf_cookie
from bootstrap_modal_forms.generic import BSModalCreateView


import pdb

#what is the purpose of this function?

@ensure_csrf_cookie
def cafes_home(request):
    return render(request, 'testingland/index.html')

def index_2(request):
    return render(request, 'testingland/index2.html')

class cafe_list(ListView):
    template_name = 'testingland/electra.html'
    context_object_name = 'cafes'
    model = mapCafes

    def get_queryset(self):
        # venue_name = self.request.GET.get('name', None)
        lat = self.request.GET.get('geolat', None)
        long = self.request.GET.get('geolong', None)
        print(lat, long)
        if lat and long:
            # final_name = string(name)
            loc = Point(float(long), float(lat), srid=4326);

        return mapCafes.objects.annotate(distance=Distance('geolocation', loc)).order_by('distance')[0:10]

def marker_info(request):
    template_name = 'testingland/electra.html'
    markerlat = request.GET.get('geolat', None)
    markerlong = request.GET.get('geolong', None)
    print(markerlat, markerlong)
    if markerlat and markerlong:
        markerloc = Point(float(markerlong), float(markerlat), srid=4326);

        qs = mapCafes.objects.annotate(distance=Distance('geolocation', markerloc)).order_by('distance')[0:10] #this is the sticky part
        return JsonResponse([
                [cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x]
                for cafe in qs
        ], safe=False)

def info_box(request):
    template_name = 'testingland/index2.html'
    markerlat = request.GET.get('geolat', None)
    markerlong = request.GET.get('geolong', None)
    print(markerlat, markerlong)
    if markerlat and markerlong:
        markerloc = Point(float(markerlong), float(markerlat), srid=4326);

        qs = mapCafes.objects.annotate(distance=Distance('geolocation', markerloc)).order_by('distance')[0:10] #this is the sticky part
        return JsonResponse([
                [cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x]
                for cafe in qs
        ], safe=False)


@ensure_csrf_cookie
def dashboard(request):
    return render(request, 'testingland/dashboard.html')

class user_playlist(ListView):
    template_name = 'testingland/playlist.html'
    context_object_name = 'playlist'
    model = UserVenue

    def get_queryset(self):
        venue = self.request.GET.get('venue', None)
        list = self.request.GET.get('list', None)
        playlist = UserVenue.objects.filter(list__user=self.request.user)
        return playlist

def join_anybody(request):
    return render(request, 'testingland/join.html')

class SignUp(generic.CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('cafes_home')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        view = super(SignUp, self).form_valid(form)
        username, password = form.cleaned_data.get('username'), form.cleaned_data.get('password1')
        user = authenticate(username=username, password=password)
        login(self.request, user)
        return view

#CRUD
class NewList(generic.CreateView):
     model = UserList
     fields = ['list_name']
     template_name = 'testingland/newlist.html'
     success_url = reverse_lazy('cafes_home')

     def form_valid(self, form):
         form.instance.user = self.request.user
         super(NewList, self).form_valid(form)
         return redirect('cafes_home')

class DetailList(generic.DetailView):
    model = UserList
    template_name = 'testingland/cafe.html'

class UpdateList(generic.UpdateView):
    model = UserList
    template_name = 'testingland/update_list.html'
    fields = ['list_name']
    success_url = reverse_lazy('dashboard')

class DeleteList(generic.DeleteView):
    model = UserList
    template_name = 'testingland/delete_list.html'
    fields = ['list_name']
    success_url = reverse_lazy('dashboard')


# class NewList(BSModalCreateView):
#     template_name = 'testingland/index.html'
#     form_class = UserList
#     success_message = 'Success: List Create was created.'
#     success_url = reverse_lazy('cafes_home')
