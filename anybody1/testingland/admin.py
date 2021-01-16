from django.contrib import admin

# Register your models here.

from .models import UserList, UserVenue

class UserListAdmin(admin.ModelAdmin):
    list_display = ['user', 'list_name']

admin.site.register(UserList, UserListAdmin)

class UserVenueAdmin(admin.ModelAdmin):
    list_display = ['list', 'venue']

admin.site.register(UserVenue, UserVenueAdmin)
