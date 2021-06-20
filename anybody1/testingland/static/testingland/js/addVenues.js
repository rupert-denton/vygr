var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
script.defer = true;

    window.initMap = function() {
      console.log("Loaded");
      
        //google API Assets
        //map
        const map = new google.maps.Map(document.getElementById("addMap"), {
          center: { lat: -34.397, lng: 150.644 },
          zoom: 8,
        });
      
        //marker
        const marker = new google.maps.Marker({
          position: { lat: -34.397, lng: 150.644 },
          map: map
        })
        
        //geocoder
        const geocoder = new google.maps.Geocoder();

        
        document.getElementById("create").addEventListener("click", () => { 
        console.log("Clicked!")
        geocodeCafeAddress(geocoder, marker, map); 

        document.getElementById("save").addEventListener("click", () => { 
        console.log("Clicked Save!")
        commitNewCafe(); 
      })
    })
  }
  document.head.appendChild(script);


$(document).ready(function() {
console.log("Welcome to AddCafe World");

});

const geocodeCafeAddress = function (geocoder, marker, map) {
  let address = document.getElementById("venueAddress").value; 
  console.log(address)
  geocoder.geocode({
    address: address
  }, (results, status) => {
    if (status === "OK") {
      console.log("Successfully geocoded address input");
      var geolat = parseFloat(results[0].geometry.location.lat());
      var geolong = parseFloat(results[0].geometry.location.lng());
      var geoloc = [geolat, geolong];
      console.log("The geocoordinates of searched address are " + geoloc);
      writeCoordinates(geolat, geolong, marker, map)
    };
  })
}

const writeCoordinates = function (latitude, longitude, marker, map) {
  document.getElementById("latitude").innerHTML = latitude;
  document.getElementById("longitude").innerHTML = longitude;
  latitude = parseFloat(document.getElementById("latitude").innerHTML);
  longitude = parseFloat(document.getElementById("longitude").innerHTML);
  changeMarkerPosition(latitude, longitude, marker, map)
}

const changeMarkerPosition = function (markerlat, markerlong, marker, map){
  let name = document.getElementById("venueName").value;
  let address = document.getElementById("venueAddress").value;
  let type = document.getElementById("venueType").value;
  

  const infowindow = new google.maps.InfoWindow();
  marker.setPosition(new google.maps.LatLng(markerlat, markerlong));
  marker.addListener("click", () => {
    infowindow.open(map, marker);
    infowindow.setContent(name, address, type);
    });
  map.setCenter(marker.getPosition());
  map.setZoom(15)
}

const reviewBeforeSend = function () {
  let name = document.getElementById("venueName").value;
  let type = document.getElementById("venueType").value;
  let address = document.getElementById("venueAddress").value;
  let latitude = parseFloat(document.getElementById("latitude").innerHTML);
  let longitude = parseFloat(document.getElementById("longitude").innerHTML);


  $("#database-modal").modal('show');
  $("#added-venue-name").html("Name:" + " " + name);
  $("#added-venue-type").html("Type:" + " " + type);
  $("#added-venue-address").html("Address:" + " " + address);
  $("#added-venue-latitude").html("Latitude:" + " " + latitude);
  $("#added-venue-longitude").html("Longitude:" + " " + longitude);
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const commitNewCafe = function () {
  let name = document.getElementById("venueName").value;
  let type = document.getElementById("venueType").value;
  let address = document.getElementById("venueAddress").value;
  let latitude = parseFloat(document.getElementById("latitude").innerHTML);
  let longitude = parseFloat(document.getElementById("longitude").innerHTML);

  $.ajax({
    type: 'POST',
    url: '/add_cafe/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'venuename': name,
      'venuetype': type,
      'venueaddress': address,
      'latitude': latitude,
      'longitude': longitude
    },
    success: function(data) {
      console.log("Data sent");
    }
  });
}





  
