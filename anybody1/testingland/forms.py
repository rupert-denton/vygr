from .models import Venues, UserList
from django import forms
from bootstrap_modal_forms.forms import BSModalModelForm

class PlaceForm(forms.ModelForm):
    class Meta:
        model = Venues
        fields = ['venue_name', 'venue_address', 'venue_long' ,'venue_lat', 'venue_geolocation']
        labels = {'venue_name': 'Venue Name', 'venue_address': 'Venue Address'}

class UserListForm(BSModalModelForm):
    class Meta:
        model = UserList
        fields = ['list_name', 'user']
