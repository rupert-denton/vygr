from django.shortcuts import render
from django.views import generic
from django.contrib.gis.geos import fromstr, Point
from django.contrib.gis.db.models.functions import Distance
from .models import mapCafes, listCafes

# Create your views here.
#user location
longitude = 145.11636479999999
latitude = -38.0338176

user_location = Point(longitude, latitude, srid=4326)

#venues
class Home(generic.ListView):
    model = mapCafes
    context_object_name = 'cafe_name'
    queryset = mapCafes.objects.annotate(distance=Distance('geolocation',
    user_location)
    ).order_by('distance')[0:10]
    template_name = 'cafes/index.html'

#ajax attempt
