from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import mapCafes, listCafes

# Register your models here.

@admin.register(mapCafes)
class ShopAdmin(OSMGeoAdmin):
    list_display = ('cafe_name', 'cafe_address', 'geolocation')
