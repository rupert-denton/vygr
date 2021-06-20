from .models import mapCafes, UserList, UserVenue, User, Venues
from django import forms
from django.forms import ModelForm
from bootstrap_modal_forms.forms import BSModalModelForm

class PlaceForm(forms.ModelForm):
    class Meta:
        model = Venues
        fields = ['venue_name', 'venue_address', 'venue_long' ,'venue_lat', 'venue_geolocation']
        labels = {'venue_name': 'Venue Name', 'venue_address': 'Venue Address'}

class addCafesForm(forms.ModelForm):
    class Meta:
        model = mapCafes
        fields = ['cafe_name', 'venue_type', 'cafe_address', 'cafe_long', 'cafe_lat']


class UserListForm(BSModalModelForm):
    class Meta:
        model = UserList
        fields = ['list_name', 'user']

