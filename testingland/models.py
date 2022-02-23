from django.contrib.gis.db import models
from django.contrib.auth.models import User
import uuid

# Create your models here.
# class listCafes(models.Model):
#     id = models.BigAutoField(primary_key=True)
#     list_cafe_name = models.CharField(max_length=200)
#     list_cafe_address = models.CharField(max_length=200)
#     list_cafe_long = models.FloatField()
#     list_cafe_lat = models.FloatField()
#     list_geolocation = models.PointField(geography=True, blank=True, null=True)

#     class Meta:
#         managed = False

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    # class Meta:
    #     # managed = False
    #     # db_table = 'auth_group'

class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        # managed = False
        # db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        # managed = False
        # db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


# class AuthUser(models.Model):
#     password = models.CharField(max_length=128)
#     last_login = models.DateTimeField(blank=True, null=True)
#     is_superuser = models.BooleanField()
#     username = models.CharField(unique=True, max_length=150)
#     first_name = models.CharField(max_length=150)
#     last_name = models.CharField(max_length=150)
#     email = models.CharField(max_length=254)
#     is_staff = models.BooleanField()
#     is_active = models.BooleanField()
#     date_joined = models.DateTimeField()

#     class Meta:
#         managed = False
#         db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(User, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        # managed = False
        # db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(User, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        # managed = False
        # db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(User, models.DO_NOTHING)

    # class Meta:
    #     # managed = False
    #     # db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        # managed = False
        # db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    # class Meta:
    #     # managed = False
    #     # db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    # class Meta:
    #     # managed = False
    #     # db_table = 'django_session'


# class ShopsCafe(models.Model):
#     name = models.CharField(max_length=100)
#     location = models.PointField()
#     address = models.CharField(max_length=100)

#     class Meta:
#         managed = False
#         db_table = 'shops_cafe'



class mapCafes(models.Model): 
    id = models.BigAutoField(primary_key=True)
    cafe_name = models.CharField(max_length=200)
    cafe_address = models.CharField(max_length=200)
    cafe_long = models.FloatField()
    cafe_lat = models.FloatField()
    geolocation = models.PointField(geography=True, blank=True, null=True)
    venue_type = models.CharField(max_length=200)
    source = models.CharField(max_length=200)
    cafe_image_url = models.CharField(max_length=200, default='0000000', null=False)

    # class Meta:
    #     # managed = False

    def __str__(self):
        return self.cafe_name

class SharedLink(models.Model):
    cafe = models.OneToOneField(mapCafes, on_delete=models.PROTECT)
    uuid = models.UUIDField(default=uuid.uuid4, primary_key=True)


#Create an intermediary class that references the mapCafes class (with a ForeignKey), when someone hits an "add-to-list"
#the two keys needed are what is the venue/cafe and what is the list.

class liked(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    liked_venue = models.ForeignKey(mapCafes, on_delete=models.PROTECT)
    
   
class UserList(models.Model):
    list_name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    
    def __str__(self):
        return self.list_name

class SharedListLink(models.Model):
    list = models.OneToOneField(UserList, on_delete=models.CASCADE)
    uuid = models.UUIDField(default=uuid.uuid4, primary_key=True)


class UserVenue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    venue = models.ForeignKey(mapCafes, on_delete=models.PROTECT)
    user_list = models.ForeignKey(UserList, on_delete=models.CASCADE)

#this is here because removing it made it a headache

class Venues(models.Model):
    venue_name = models.CharField(max_length=255)
    venue_address = models.CharField(max_length=100)
    venue_long = models.FloatField(null=True)
    venue_lat = models.FloatField(null=True)
    venue_geolocation = models.PointField(geography=True, blank=True, null=True)
    user_list = models.ForeignKey(UserList, on_delete=models.CASCADE) #this may need to change to a manytomany model
#this is here because removing it made it a headache

class VenueList(models.Model):
    title = models.CharField(max_length=100)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    venue_name = models.CharField(max_length=255)

class UserConnections(models.Model):
    follower = models.ForeignKey(User, related_name="following", on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name="followers", on_delete=models.CASCADE)

class PromotionCampaign(models.Model):
    promo_venue = models.ForeignKey(mapCafes, on_delete=models.PROTECT)
    promo_title = models.CharField(max_length=255)
    promo_quantity =  models.IntegerField()

class VenueComments(models.Model):
    venue = models.ForeignKey(mapCafes, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment =  models.CharField(max_length=10000)

class ReplyComments(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    original_comment = models.ForeignKey(VenueComments, on_delete=models.PROTECT)
    reply_comment = models.CharField(max_length=10000)

class feedback (models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    feedback_type = models.CharField(max_length=500)
    feedback_content = models.CharField(max_length=10000)
    # location = models.CharField(max_length=1000)

class suggestion (models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    venue_name = models.CharField(max_length=500)
    venue_address = models.CharField(max_length=1000)
    venue_type = models.CharField(max_length=500)
