
//ajax call for user location - at the moment (14 September) this uses HTML IP Geolocator but it is very inaccurate
//google maps: AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk
$(document).ready(function(){
//Map Creation
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap';
  script.defer = true;



  // Get user location and make ajax call


    $("#cafes").text(function(){
      if(navigator.geolocation) {
        //first check if it exists
          console.log("Success")

          var positionOptions = {
          timeout : Infinity,
          maximumAge : 0,
          enableHighAccuracy : true
          }

          function catchError(positionError) {
            switch(positionError.code)
            {
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

          navigator.geolocation.watchPosition(getPosition, catchError, positionOptions);

         function getPosition(position){
           console.log("Latitude:" + position.coords.latitude + " " + "Longitude:" + position.coords.longitude);
           var lat = parseFloat(position.coords.latitude);
           var long = parseFloat(position.coords.longitude);
           var loc = [lat, long];
           console.log(loc);
           $("#user_location").text(loc);

           $.ajax({
             type: 'GET',
             url: '/electra/cafe_list/',
             data: {
               'lat': parseFloat(lat),
               'long': parseFloat(long),
              },

             success: function(data) {
               $("#cafe_list").html(data);

             // Attach your callback function to the `window` object
             window.initMap = function() {
               var userloc = {lat: lat, lng: long}; // The location of user
               map = new google.maps.Map(document.getElementById('map'), { // Centre map on user
               center: userloc,
               zoom: 16
               });
               var marker = new google.maps.Marker({position: userloc, map: map});
              };

             // Append the 'script' element to 'head'
             document.head.appendChild(script);
           }


            })
           }
         }
       })
     });
