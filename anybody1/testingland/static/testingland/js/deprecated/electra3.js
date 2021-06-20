//ajax call for user location - at the moment (14 September) this uses HTML IP Geolocator but it is very inaccurate
//google maps: AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk

//homepage map
$(document).ready(function() {

  //Map Creation
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap';
  script.defer = true;

  // Get user location
  $("#cafes").text(function() {
    if (navigator.geolocation) { //checks geolocation functionality exists (eg in browser)
      console.log("Success")
      var positionOptions = {
        timeout: Infinity,
        maximumAge: 0,
        enableHighAccuracy: true
      }

      function catchError(positionError) {
        switch (positionError.code) {
          case positionError.TIMEOUT:
            alert("The request to get user location has aborted as it has taken too long.");
            break;
          case positionError.POSITION_UNAVAILABLE:
            alert("Location information is not available.");
            break;
          case positionError.PERMISSION_DENIED:
            alert("Permission to share location information has been denied!");
            break;
          default:
            alert("An unknown error occurred.");
        }
      }

      navigator.geolocation.watchPosition(getPosition, catchError, positionOptions); //keeps track of user location in case they move.

      //Once geolocation is detected: get the user's position.
      function getPosition(position) {
        var lat = parseFloat(position.coords.latitude);
        var long = parseFloat(position.coords.longitude);
        var loc = [lat, long];
        console.log("User location is " + loc);

        // Attach your callback function to the `window` object (window object is the browser window)
        window.initMap = function() {
          var userloc = {
            lat: lat,
            lng: long
          }; // The location of user
          map = new google.maps.Map(document.getElementById('map'), { //gets the map div on the template.
            center: userloc, // Centre map on user
            zoom: 15
          });
          console.log("Map done.")

          //search functionality
          const geocoder = new google.maps.Geocoder();
          document.getElementById("submit").addEventListener("click", () => { //listen for click "search button.
            geocodeAddress(geocoder, map);
          });
        }

        function geocodeAddress(geocoder, resultsMap) {
          let address = document.getElementById("address").value; //gets user entry in address box
          geocoder.geocode({
            address: address
          }, (results, status) => {
            if (status === "OK") {
              resultsMap.setCenter(results[0].geometry.location);
              
              console.log("Successfully geocoded user input");
              var geolat = parseFloat(results[0].geometry.location.lat());
              var geolong = parseFloat(results[0].geometry.location.lng());
              var geoloc = [geolat, geolong];
              console.log("The geocoordinates of searched address are " + geoloc);

              //list and markers
              //list
              $.ajax({
                type: 'GET', url: '/electra/cafe_list/', //this is where ajax goes with the get request
                data: { //the geocoordinates (from above) are used by ajax as a reference point when reaching to views.py
                  'geolat': parseFloat(geolat),
                  'geolong': parseFloat(geolong)
                },
                success: function(data) {
                  $("#cafe_list").html(data); //cafe-list has now been loaded at the cafe_list div
                  console.log("List Loaded");

                  //markers
                  $.ajax({
                    type: 'GET',
                    url: '/electra/marker_info/',
                    data: {
                      'geolat': parseFloat(geolat),
                      'geolong': parseFloat(geolong)
                    },
                    success: function(data) {
                      create_markers(data);
                    }
                  });
                }
              });
            }
          })
        }
        // Append the 'script' element to 'head'
        document.head.appendChild(script);
      }

      //Electra Ajax Call: ajax call takes the geocoordinates to views.py to get venues

      function create_markers(locations) {
        var markers = [];
        var marker, i;
        

        //adds markers to map
        for (i = 0; i < locations.length; i++) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[i][2], locations[i][3]), //point,
            map: map,
            animation: google.maps.Animation.DROP
          });
          markers.push(marker);

          function setMapOnAll(map) {
            for (let i = 0; i < markers.length; i++) {
              markers[i].setMap(map);
            }
          }

          function clearMarkers() {
            setMapOnAll(null);
          }


          map.getCenter();
          console.log()


          //markers and info
          document.getElementById("submit").addEventListener("click", () => {
            console.log("Clicked!");
            clearMarkers(null);
          });

          var infowindow = new google.maps.InfoWindow();         

          //attaches info to each marker
          marker.addListener("click", (function(marker, i) { 
            return function() {
             
              map.setZoom(16);
              map.setCenter(marker.getPosition());
            
              infowindow.setContent(locations[i][0]);
              infowindow.open(map, marker);
              console.log("You Clicked a marker!");

              $.ajax({
                type: 'GET',
                url: '/electra/info_box/',
                data: {
                  'venuename': locations[i][0]
                },
                success: function(data) {
                  var results = JSON.stringify(data).split(',');
                  var cafeName = results[0].replace(/[^a-zA-Z0-9é ]/g, "");
                  var cafeAddress = results[1].replace(/[^a-zA-Z0-9é ]/g, "") + "," + results[2].replace(/[^a-zA-Z0-9é ]/g, "");
                  var cafeDescription = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
                
                  $("#venue-modal").modal('show');
                  $("#venue-name").html(cafeName);
                  $("#venue-address").html(cafeAddress);
                  $("#venue-description").html(cafeDescription);

                  console.log(results);
                }
              });
              
            }
          })(marker, i));
        };
      }

      
    }
  })
})
