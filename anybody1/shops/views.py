from django.shortcuts import render
from django.views import generic
from django.contrib.gis.geos import fromstr, Point
from django.contrib.gis.db.models.functions import Distance
from .models import ACafes

# Create your views here.
longitude = 145.0058511
latitude = -37.7570553

user_location = Point(longitude, latitude, srid=4326)

class Home(generic.ListView):
    model = ACafes
    context_object_name = 'cafe_name'
    queryset = ACafes.objects.annotate(distance=Distance('geolocation',
    user_location)
    ).order_by('distance')[0:300]
    template_name = 'cafes/index.html'
