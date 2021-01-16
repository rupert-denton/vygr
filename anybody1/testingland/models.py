from django.contrib.gis.db import models
from django.contrib.auth.models import User
# Create your models here.

class listCafes(models.Model):
    id = models.BigAutoField(primary_key=True)
    list_cafe_name = models.CharField(max_length=200)
    list_cafe_address = models.CharField(max_length=200)
    list_cafe_long = models.FloatField()
    list_cafe_lat = models.FloatField()
    list_geolocation = models.PointField(geography=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'a_cafes'

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class ShopsCafe(models.Model):
    name = models.CharField(max_length=100)
    location = models.PointField()
    address = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'shops_cafe'

class mapCafes(models.Model): #make this more
    id = models.BigAutoField(primary_key=True)
    cafe_name = models.CharField(max_length=200)
    cafe_address = models.CharField(max_length=200)
    cafe_long = models.FloatField()
    cafe_lat = models.FloatField()
    geolocation = models.PointField(geography=True, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'a_cafes'


    def __str__(self):
        return self.cafe_name


#Create an intermediary class that references the mapCafes class (with a ForeignKey), when someone hits an "add-to-list"
#the two keys needed are what is the venue/cafe and what is the list.

# class VenueOnList(models.Model):

class UserList(models.Model):
    list_name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE) #is this okay?

    def __str__(self):
        return self.list_name

class UserVenue(models.Model):
    venue = models.ForeignKey(mapCafes, on_delete=models.PROTECT)
    # this a manytomany relationships (1 user can have multiple lists, and 1 list
    # can have many venues)
    #user = models.ForeignKey(User, on_delete=models.PROTECT)
    list = models.ForeignKey(UserList, on_delete=models.PROTECT)
    #venue variable grabs the cafe details from mapCafes, the
    #.PROTECT constraint stops the database mapCafes being wiped when someone deletes

    class Meta:
        unique_together = ['list','venue']

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