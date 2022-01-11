//ajax call for user location - at the moment (14 September) this uses HTML IP Geolocator but it is very inaccurate
//google maps: AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk

//homepage map
$(document).ready(function() {
  var markers = new Set(); //empty array
  var marker, i;

  //Map Creation
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
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
            zoom: 16,
            mapId: '33df39eac4360b95'
          });
          console.log("Map done.")
          // google.maps.event.addListener(map, "bounds_changed", ()

          document.getElementById("area-search").addEventListener("click", () => { 
            console.log("Clicked!");

              var lat0 = map.getBounds().getNorthEast().lat();
              var lng0 = map.getBounds().getNorthEast().lng();
              var lat1 = map.getBounds().getSouthWest().lat();
              var lng1 = map.getBounds().getSouthWest().lng();
              console.log('Map Moved');

              $.ajax({
                type: 'GET',
                url: '/electra/marker_info/',
                data: {
                  'neLat': parseFloat(lat0),
                  'neLng': parseFloat(lng0),
                  'swLat': parseFloat(lat1),
                  'swLng': parseFloat(lng1)
                },
                success: function (data) {
                  
                    add_markers(data); //refer to below function for the running of this loop
                  
                }
              });
            });

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

              var lat0 = map.getBounds().getNorthEast().lat();
              var lng0 = map.getBounds().getNorthEast().lng();
              var lat1 = map.getBounds().getSouthWest().lat();
              var lng1 = map.getBounds().getSouthWest().lng();
              console.log('Map Moved');

              $.ajax({
                type: 'GET',
                url: '/electra/marker_info/',
                data: {
                  'neLat': parseFloat(lat0),
                  'neLng': parseFloat(lng0),
                  'swLat': parseFloat(lat1),
                  'swLng': parseFloat(lng1)
                },
                success: function (data) {
                  
                    add_markers(data); //refer to below function for the running of this loop

                }
              });
            }
          })
        }
        // Append the 'script' element to 'head'
        document.head.appendChild(script);
      }        

      function add_markers(ajaxData, timeout) {  
        for (i = 0; i < ajaxData.length; i++) { //puts markers in the markers set
          if(! markers.has(JSON.stringify(ajaxData[i]))) {
              marker = new google.maps.Marker({
                position: new google.maps.LatLng(ajaxData[i][2], ajaxData[i][3]),
                map: map,
                animation: google.maps.Animation.DROP,
              });

              //attaches info to each marker
              marker.addListener("click", (function(marker, i) { 
                return function() {
                
                  map.setCenter(marker.getPosition());
                
                  infowindow.setContent(ajaxData[i][0]);
                  infowindow.open(map, marker);
                  console.log("You Clicked a marker!");

                  $.ajax({
                    type: 'GET',
                    url: '/electra/info_box/',
                    data: {
                      'venuename': ajaxData[i][0]
                    },
                    
                      success: function(data) {
                        var results = JSON.stringify(data).split('"');
                        console.log(results);
                        var cafeId = results[0];
                        var cafeName = results[1].replace(/[^a-zA-Z0-9éè ]/g, "");
                        var cafeAddress = results[2].replace(/[^a-zA-Z0-9éè ]/g, "") + "," + results[3].replace(/[^a-zA-Z0-9éè ]/g, "");
                        var cafeDescription = results[6];
                        $("#venue-modal").modal('show');
                        $("#venue-name-modal").html(cafeName);
                        $("#venue-address").html(cafeAddress);
                        $("#venue-description").html(cafeDescription);
                        $("#share").html('<i class="fas fa-share-alt"></i>');
                        $("#venue-options").html('<i class="fas fa-ellipsis-h"></i>');
                        console.log(results);
                    }
                  });
                  
                }
              })(marker, i));
              markers.add(JSON.stringify(ajaxData[i]));
            }
           }        
          var infowindow = new google.maps.InfoWindow(); 
        };
      }     
  })

        window.initMap = function() {            
          map = new google.maps.Map(document.getElementById("addMap"), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
          });
        

       
  })
