from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, Http404
from django.template import loader
from django.contrib.auth.forms import UserCreationForm
from django.views.generic.edit import CreateView
from django.views import generic
from django.views.generic import ListView
from django.contrib.gis.geos import fromstr, Point
from django.contrib.gis.db.models.functions import Distance
from .models import mapCafes, listCafes

#what is the purpose of this function?
def cafes_home(request):
    return render(request, 'testingland/cafe.html')

class cafe_list(ListView):

    template_name = 'testingland/electra.html'
    context_object_name = 'cafes'
    model = mapCafes

    def get_queryset(self):
        lat = self.request.GET.get('lat', None)
        long = self.request.GET.get('long', None)
        print(lat, long)
        if lat and long:
            loc = Point(float(long), float(lat), srid=4326);

        return mapCafes.objects.annotate(distance=Distance('geolocation', loc)).order_by('distance')[0:10]

# Create your views here.
# def extra(request):
#     return render(request, 'testingland/extra.html')
#
# class ajax(CreateView):
#     template_name = 'testingland/ajax.html'
#     form_class = UserCreationForm
#
#
#
# #user location
# longitude = 145.0058511
# latitude = -37.7570553
#
# user_location = Point(longitude, latitude, srid=4326)
# #print(user_location)

# class get_cafes(generic.ListView):
#     location = 'user_l'
#     # if location.is_valid():
#     data = {'Hello':location}
#
#
#     # model = mapCafes
#     # context_object_name = 'cafe_name'
#     queryset = mapCafes.objects.annotate(distance=Distance('geolocation',
#      location))
    # ).order_by('distance')[0:10]
    # return render(request, 'testingland/hector.html')

#venues
# class hector(generic.ListView):
#     model = mapCafes
#     context_object_name = 'cafe_name'
#     user_location = GET.get('user_loc')
#     queryset = mapCafes.objects.annotate(distance=Distance('geolocation',
#     user_location)).order_by('distance')[0:10]
#     template_name = 'testingland/hector.html'



# def cafe_list(request):
#     lat = float(request.GET.get('lat'))
#     long = float(request.GET,get('long'))
#     loc = Point(lat, long, srid=4326)
#
#     local_cafes = mapCafes.objects.annotate(distance=Distance('geolocation', loc)).order_by('distance')[0:10]
#
#     return JsonResponse(
#         {
#             "cafe_name": product_name,
#             "product_id": product_id,
#             "size": size,
#             "queryresult": "nothing here",
#         }
