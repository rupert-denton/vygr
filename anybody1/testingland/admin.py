from django.contrib import admin

# Register your models here.

from .models import VenueList, UserList, UserVenue, mapCafes, VenueComments, ReplyComments, feedback, suggestion, liked

class UserListAdmin(admin.ModelAdmin):
    list_display = ['user', 'list_name']

admin.site.register(UserList, UserListAdmin)

class UserVenueAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'user_list', 'user_list_id', 'venue', 'venue_id']

admin.site.register(UserVenue, UserVenueAdmin)

class mapCafesAdmin(admin.ModelAdmin):
    list_display = ['cafe_name', 'cafe_address', 'description']

admin.site.register(mapCafes, mapCafesAdmin)

class VenueCommentsAdmin(admin.ModelAdmin):
    list_display = ['venue', 'user', 'comment']

admin.site.register(VenueComments, VenueCommentsAdmin)

class ReplyCommentsAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_comment', 'reply_comment']

admin.site.register(ReplyComments, ReplyCommentsAdmin)

class feedbackAdmin(admin.ModelAdmin):
    list_display = ['user', 'feedback_type', 'feedback_content']

admin.site.register(feedback, feedbackAdmin)

class suggestionAdmin(admin.ModelAdmin):
    list_display = ['user', 'venue_name', 'venue_address', 'venue_type']

admin.site.register(suggestion, suggestionAdmin)


class VenueListAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'venue_name']

admin.site.register(VenueList, VenueListAdmin)

class likedAdmin(admin.ModelAdmin):
    list_display = ['user', 'liked_venue']

admin.site.register(liked, likedAdmin)

