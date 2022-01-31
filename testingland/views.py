from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse, Http404
from django.template import loader
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.views.generic.edit import CreateView
from django.views import generic
from django.views.generic import ListView
from django.contrib.gis.geos import fromstr, Point, Polygon
from django.contrib.gis.db.models.functions import Distance, Envelope
from .models import liked, mapCafes, UserList, UserVenue, User, UserConnections,\
     feedback, suggestion, SharedLink, SharedListLink, VenueComments
from django.urls import reverse_lazy, reverse
from .forms import PlaceForm, UserListForm, addCafesForm
from django.views.decorators.csrf import ensure_csrf_cookie
from bootstrap_modal_forms.generic import BSModalCreateView
from bs4 import BeautifulSoup
import requests
from requests import get
import pdb
import re
from allauth.account.decorators import verified_email_required




#what is the purpose of this function?

@ensure_csrf_cookie
def cafes_home(request):
    return render(request, 'testingland/index3.html')

def index_2(request):
    return render(request, 'testingland/index2.html')

def campaign_page(request):
    return render(request, 'testingland/campaign.html')

def venue_page(request, venue_id):
    venue = get_object_or_404(mapCafes, pk=venue_id)
    return render(request, 'testingland/venue_page.html',{'venue':venue})

def broadsheet(request):
    return render(request, 'testingland/broadsheet.html')

def login_page(request):
    return render(request, 'testingland/index3.html')

@verified_email_required
def logged_in_home(request):
     return render(request, 'testingland/index3.html')

def write_description(request):
    return render(request, 'testingland/write_description.html')

def get_cafe(request):
    template_name = 'testingland/write_description.html'
    qs = mapCafes.objects.exclude(description__isnull=False)
    return JsonResponse([
            [cafe.cafe_name, cafe.cafe_address]
            for cafe in qs
    ], safe=False)

def add_cafe(request):
    if request.method == "POST":        
        x = float(request.POST.get('longitude'))
        y = float(request.POST.get('latitude'))
        new_obj = mapCafes()
        new_obj.cafe_name = request.POST.get('venuename')
        new_obj.cafe_address = request.POST.get('venueaddress')
        new_obj.cafe_long = x
        new_obj.cafe_lat = y
        new_obj.venue_type = request.POST.get('venuetype')
        new_obj.description = request.POST.get('venuedescription')
        new_obj.geolocation = Point(x, y)
        new_obj.source = request.user.id
        new_obj.save()
        
    return JsonResponse([
            new_obj.id, new_obj.cafe_name     
    ], safe=False)

def like_venue(request):
     if request.method == "POST":
        new_obj = liked()
        new_obj.user = request.user
       
        new_obj.liked_venue = mapCafes(id = request.POST.get('liked_venue'))
        new_obj.save()
        return render(request, 'testingland/index3.html')

def remove_venue_from_liked(request):
    data = liked.objects.filter(liked_venue=request.GET.get('venue'))
    print(data)
    data.delete()
    return render(request, 'testingland/index3.html')

def update_cafe(request):
    if request.method == "POST":        
        new_obj = mapCafes()

        cafe_name = request.POST.get('venuename')
        cafe_address = request.POST.get('venueaddress')
        cafe_long = float(request.POST.get('longitude'))
        cafe_lat = float(request.POST.get('latitude'))
        venue_type = request.POST.get('venuetype')
        description = request.POST.get('venuedescription')
        
        print(description)
        cafe = mapCafes.objects.get(cafe_name=cafe_name)

        cafe.cafe_name = cafe_name
        cafe.cafe_address = cafe_address
        cafe.cafe_long = cafe_long
        cafe.cafe_lat = cafe_lat
        cafe.venue_type = venue_type
        cafe.description = description
        cafe.source = request.user
        cafe.save()
        
    return render(request, 'testingland/write_description.html')

def getUserlists(request):
    print(request.user)
    qs = UserList.objects.filter(user=request.user)
    print(qs)
    return JsonResponse([
           [item.id, item.list_name]
            for item in qs
    ], safe=False)

def create_new_list(request):
    if request.method == "POST":
        new_obj = UserList()
        user = request.user
        list_name = request.POST.get('list_name')
        new_obj.list_name = list_name
        new_obj.user = user
        new_obj.save()
        return JsonResponse([
            ], safe=False)

def update_list_name(request):
    if request.method == "POST":
        new_obj = UserList()
        edited_list = request.POST.get('id')
        print(edited_list)
        current_list = UserList.objects.get(id=edited_list)
        new_list_name = request.POST.get('list_name')
        current_list.list_name = new_list_name
        current_list.save()

    return render(request, 'testingland/index.html')

def add_venue_comment(request):
    if request.method == "POST":
            comment = request.POST.get('comment')
            print(comment)
            venue = request.POST.get('venue_id')
            print(venue)
            map_cafes = mapCafes.objects.get(id=venue)
            new_obj = VenueComments()
            new_obj.venue = map_cafes
            new_obj.user = request.user
            new_obj.comment = comment
            
            new_obj.save()
    
    return JsonResponse([
               
    ], safe=False)

def write_image(request):
    return render(request, 'testingland/write_image.html')

def search(request):
    template_name = 'testingland/write_image.html'
    search_term = request.GET.get('search_term', None)
    print(search_term)
    qs = mapCafes.objects.filter(cafe_name__istartswith = search_term)[0:5]
    return JsonResponse([
            [cafe.id, cafe.cafe_name, cafe.cafe_address]
            for cafe in qs
    ], safe=False)

def venue_filter(request):
    search_term = request.GET.get('search_term', None)
    print(search_term)
    qs = mapCafes.objects.filter(description__icontains = search_term)[0:5]
    return JsonResponse([
            [search_term]
    ], safe=False)

def remove_venue_from_list(request):
    user_list = request.GET.get('user_list', None)
    venue = request.GET.get('venue', None)
    print(user_list, venue)
    data = UserVenue.objects.filter(user_list = user_list, venue = venue)
    print(data)
    data.delete()
    return render(request, 'testingland/index3.html')

def get_searched_venue_details(request):
    template_name = 'testingland/write_image.html'
    name = request.GET.get('venuename', None)
    qs = mapCafes.objects.filter(cafe_name = name) 
    return JsonResponse([
            [cafe.id, cafe.cafe_name, cafe.cafe_address, cafe.description, cafe.geolocation.y, cafe.geolocation.x]
            for cafe in qs
    ], safe=False)

def get_searched_image(request):
    template_name = 'testingland/write_image.html'
    name = request.GET.get('venuename', None)
    print(name)
    qs = mapCafes.objects.filter(cafe_name = name)
    return JsonResponse([
            [cafe.cafe_name, cafe.cafe_address]
            for cafe in qs
    ], safe=False)

def get_cafe_without_image(request):
    template_name = 'testingland/write_description.html'
    qs = mapCafes.objects.exclude(image_embed__isnull=False)
    return JsonResponse([
            [cafe.cafe_name, cafe.cafe_address]
            for cafe in qs
    ], safe=False)

def add_image(request):
    if request.method == "POST":        
        new_obj = mapCafes()
        cafe_name = request.POST.get('venuename')
        print(cafe_name)
        cafe = mapCafes.objects.get(cafe_name=cafe_name)
        embed_code = request.POST.get('embedcode')

        cafe.image_embed = embed_code
        cafe.save()
        
    return render(request, 'testingland/write_image.html')

def get_cafe_image(request):
    template_name = 'testingland/write_description.html'
    name = request.GET.get('venuename', None)
    qs = mapCafes.objects.filter(cafe_name = name) 
    return JsonResponse([
            [cafe.image_embed]
            for cafe in qs
    ], safe=False)


def connections(request):
    return render(request, 'testingland/connections.html')

def build_link(request, pk):
    try:
        
        # /electra/4bc09c1e-323b-4682-b9d3-6d6b5e086db5/
        cafe = mapCafes.objects.get(pk=pk)
        print("Print ", cafe)
        link, _ = SharedLink.objects.get_or_create(cafe=cafe, defaults={
            'cafe': cafe
        })
        
        return JsonResponse({'link': reverse(visit_link, kwargs={'uu': str(link.uuid)}) } )
    except mapCafes.DoesNotExist:
        return JsonResponse({'link': '' } )

def visit_link(request, uu):
    link = SharedLink.objects.get(uuid=uu)
    cafe = mapCafes.objects.get(pk=link.cafe.pk)
    return render(request, 'testingland/index3.html',
        {'cafe': cafe}
    )

def build_list_link(request, pk):
    try:
        list = UserList.objects.get(pk=pk)
        print(list)
        link, _ = SharedListLink.objects.get_or_create(list=list, defaults={
            'list': list
        })
        
        return JsonResponse({'link': reverse(visit_list_link, kwargs={'uu': link.uuid}) } )
    except mapCafes.DoesNotExist:
        return JsonResponse({'link': '' } )

def visit_list_link(request, uu):
    link = SharedListLink.objects.get(uuid=uu)
    list = UserList.objects.get(pk=link.list.pk)
    return render(request, 'testingland/index3.html',
        {'list': list}
    )

def marker_info(request):
    # template_name = 'testingland/electra.html'
    neLat = request.GET.get('neLat', None)
    neLng = request.GET.get('neLng', None)
    swLat = request.GET.get('swLat', None)
    swLng = request.GET.get('swLng', None)
    ne = (neLat, neLng)
    sw = (swLat, swLng)

    xmin = float(sw[1])
    ymin = float(sw[0])
    xmax = float(ne[1])
    ymax = float(ne[0])
    bbox = (xmin, ymin, xmax, ymax)
    print(bbox)

    geom = Polygon.from_bbox(bbox)


    qs = mapCafes.objects.filter(geolocation__coveredby=geom)
    print(qs)

    return JsonResponse([
            [cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x, cafe.source, cafe.venue_type, cafe.id]
            for cafe in qs
    ], safe=False)

def place_search(request):
    template_name = 'testingland/index2.html'
    name = request.GET.get('venuename', None)
    if name:
        print(name)
        qs = mapCafes.objects.filter(cafe_name = name) 
        
    else: 
        pk = request.GET.get('pk', None)
        print(pk)
        qs = mapCafes.objects.filter(pk=pk)

    return JsonResponse([
                [cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x, cafe.source, cafe.venue_type, cafe.id]
                for cafe in qs
        ], safe=False)

def get_friends(request):
    template_name = 'testingland/electra.html'
    neLat = request.GET.get('neLat', None)
    neLng = request.GET.get('neLng', None)
    swLat = request.GET.get('swLat', None)
    swLng = request.GET.get('swLng', None)
    ne = (neLat, neLng)
    sw = (swLat, swLng)

    xmin = float(sw[1])
    ymin = float(sw[0])
    xmax = float(ne[1])
    ymax = float(ne[0])
    bbox = (xmin, ymin, xmax, ymax)

    geom = Polygon.from_bbox(bbox)

    friends = UserConnections.objects.filter(
    follower=request.user
    )

    cafes = mapCafes.objects.filter(
        geolocation__coveredby=geom,
        uservenue__user_list__user__pk__in=friends
    ).distinct()
    
    friend_list = [[friend.followed.username] for friend in friends]
    print(friend_list)
    friend_cafe_list = [[cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x, cafe.venue_type, cafe.source] 
    for cafe in cafes]
    print(friend_cafe_list)
    
    return JsonResponse([
            {
    'friends': friend_list,
    'cafes': friend_cafe_list
    }
    ], safe=False)
    

def new_marker(request):
    template_name = 'testingland/index2.html'
    markerlat = request.GET.get('geolat', None)
    markerlong = request.GET.get('geolong', None)
    print(markerlat, markerlong)
    if markerlat and markerlong:
        markerloc = Point(float(markerlong), float(markerlat), srid=4326);

        qs = mapCafes.objects.annotate(distance=Distance('geolocation', markerloc)).order_by('distance') 
        return JsonResponse([
                [cafe.cafe_name, cafe.cafe_address, cafe.geolocation.y, cafe.geolocation.x]
                for cafe in qs
        ], safe=False)

def all_venues(request):

    qs = mapCafes.objects.all()
    print(qs)
    return JsonResponse([
        [venue.cafe_name, venue.cafe_address]
        for venue in qs
    ], safe=False)

def info_box(request):
    # template_name = 'testingland/index2.html'
    pk = request.GET.get('pk', None)
    qs = mapCafes.objects.filter(pk = pk) 
    return JsonResponse([
            [cafe.id, cafe.cafe_name, cafe.cafe_address, cafe.source, cafe.venue_type, cafe.cafe_image_url]
            for cafe in qs
    ], safe=False)

def get_users(request):
    template_name = 'testingland/users.html'
    qs = User.objects.all()  
    return JsonResponse([
            [user.username]
            for user in qs
    ], safe=False)

def getUserMarkers(request):
    pk = request.GET.get('pk', None)
    print(pk)
    qs = mapCafes.objects.filter(pk=pk)
    print(qs)
    return JsonResponse([
        [cafe.cafe_name, cafe.cafe_address, cafe.cafe_lat, cafe.cafe_long, cafe.source, cafe.venue_type, cafe.id]
        for cafe in qs
    ], safe=False)

def getUserVenues(request):
    userId = request.user.id
    qs = mapCafes.objects.filter(source = userId)
    print(qs)
    return JsonResponse([
        [venue.cafe_name]
        for venue in qs
    ], safe=False)

def getUserLiked(request):
    userName = request.GET.get('userName', None)
    print(userName)
    qs = liked.objects.filter(user__username = userName)
    print(qs)
    return JsonResponse([
        [venue.liked_venue.cafe_name]
        for venue in qs
    ], safe=False)


def otherUserList(request):
    userName = request.GET.get('userName', None)
    print(userName)
    qs = UserList.objects.filter(user__username=userName)
    return JsonResponse([
        [list.id, list.list_name, list.user] 
        for list in qs
    ], safe=False)


@ensure_csrf_cookie
def users(request):
    return render(request, 
    'testingland/users.html')

@ensure_csrf_cookie
def profile(request):
    return render(request, 
    'testingland/profile.html')

def broadsheet_scraper(request):
    template_name = 'testingland/broadsheet.html'
    city = request.GET.get('city', None)
    area = request.GET.get('area', None)
    print(city, area)

    url = f"https://www.broadsheet.com.au/{city}/guides/best-cafes-{area}"
    response = requests.get(url, timeout=5)

    soup_cafe_names = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_names)

    cafeNames = soup_cafe_names.findAll('h2', attrs={"class":"venue-title", }) #scrape the names
    cafeNamesClean = [cafe.text.strip() for cafe in cafeNames] #clean the names

    #addresses
    soup_cafe_addresses = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_addresses)

    cafeAddresses = soup_cafe_addresses.findAll( attrs={"class":"address-content" }) #scrape the addresses
    cafeAddressesClean = [address.text for address in cafeAddresses] #clean the addresses)
    

    fortable = list(zip(cafeNamesClean, cafeAddressesClean))

    return JsonResponse([
        (cafeNamesClean, cafeAddressesClean)
    ], safe=False)


def add_broadsheet(request):
    if request.method == "POST":  
        cafe_names = request.POST.get('cafeNames')
        cafe_addresses = request.POST.get('cafeAddresses')
        venue_type = request.POST.get('cafeType')
        cafe_lats = request.POST.get('cafeLatitudes')
        cafe_longs = request.POST.get('cafeLongitudes')

        split_names = cafe_names.split(",")
        split_addresses = cafe_addresses.split('",')
        split_latitudes = cafe_lats.split(",")
        split_longitudes= cafe_longs.split(",")    

        cafe_names = [name.strip('[' ']' ' ' '"''"').replace('"',' ') for name in split_names]
       

        cafe_addresses = [address.strip('[' ']' ' ').replace('"',' ') for address in split_addresses]

        cafe_lats = [lat.strip('[' ']' ' ').replace('"',' ') for lat in split_latitudes]
        floated_lats = [float(lat) for lat in cafe_lats]

        cafe_longs = [longitude.strip('[' ']' ' ').replace('"',' ') for longitude in split_longitudes]
        floated_longs = [float(longitude) for longitude in cafe_longs]
        
        cafe_info_tuples = zip(cafe_names, cafe_addresses, floated_lats, floated_longs)

        for new_cafe_info in cafe_info_tuples:
            # First loop new_cafe_info == below
            # ('Sonoma Bakery - Glebe', '215 Glebe Point Road', -30.23132, 151.2423223)
            # We can split the tuple into variables
            cafe_names, cafe_addresses, floated_lats, floated_longs = new_cafe_info
            new_cafe = mapCafes(cafe_name=cafe_names, cafe_address=cafe_addresses, cafe_long=floated_longs, cafe_lat=floated_lats, venue_type = 'cafe')
            new_cafe.save()
        
    return render(request, 'testingland/broadsheet.html')


class user_playlist(ListView):
    template_name = 'testingland/playlist.html'
    context_object_name = 'playlist'
    model = UserVenue

    def get_queryset(self):
        venue = self.request.GET.get('venue', None)
        list = self.request.GET.get('list', None)
        playlist = UserVenue.objects.filter(list__user=self.request.user)
        return playlist

def view_dashboard (request, username):
    # If no such user exists raise 404
    try:
        user = User.objects.get(username=username)
        print(user)
    except:
        raise Http404

    template = 'testingland/dashboard.html'
    return render (request, template)


def user_feedback(request):
    if request.method == "POST":
        new_obj = feedback()
        new_obj.user = request.user
        new_obj.feedback_type = request.POST.get('feedback_type')
        new_obj.feedback_content = request.POST.get('feedback_content')
        new_obj.save()
    return render(request, 'testingland/index3.html')


def user_suggestion(request):
    if request.method == "POST":
        new_obj = suggestion()
        new_obj.user = request.user
        new_obj.venue_name = request.POST.get('venue_name')
        new_obj.venue_address = request.POST.get('venue_address')
        new_obj.venue_type = request.POST.get('venue_type')
        new_obj.save()
    return render(request, 'testingland/index3.html')





# class cafe_list(ListView):
#     template_name = 'testingland/electra.html'
#     context_object_name = 'cafes'
#     model = mapCafes

#     def get_queryset(self):
#         # venue_name = self.request.GET.get('name', None)
#         lat = self.request.GET.get('geolat', None)
#         long = self.request.GET.get('geolong', None)
#         print(lat, long)
#         if lat and long:
#             # final_name = string(name)
#             loc = Point(float(long), float(lat), srid=4326);

#         return mapCafes.objects.annotate(distance=Distance('geolocation', loc)).order_by('distance')[0:20]