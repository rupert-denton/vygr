

//user IP address
function geolocationcheck(){
    if(navigator.geolocation) {
      //first check if it exists
        console.log("Success")

      //next use getCurrentPosition method
      navigator.geolocation.getCurrentPosition(getPosition);
      } else {
     console.log("failure")
           alert('Didnt work');
     }
   }

function getPosition(position){
  console.log("Latitude:" + position.coords.latitude + " " + "Longitude:" + position.coords.longitude)
  document.getElementById("loc").innerHTML =
	  "Latitude: " + position.coords.latitude + "<br>" +
	  "Longitude: " + position.coords.longitude;
  }

var mymap = L.map("anybody").setView([-37.7570553, 145.0058511], 13);

L.tileLayer.provider('Jawg.Streets', {
variant: 'jawg-streets',
accessToken: 'CfM4qaekho2FFKH1GyMBk2pj54YyjShGOReroBoUNYhX66tpfn9wUMKhkHtZ6fUQ'
}).addTo(mymap);

//leaflet map

function mapcheck(){
      if(navigator.geolocation) {
      //first check if it exists
      console.log("Success")

      var positionOptions = {
      timeout : Infinity,
      maximumAge : 0,
      enableHighAccuracy : true
      }

      //next use getCurrentPosition method
      navigator.geolocation.watchPosition(xycheck, catchError, positionOptions);
      }
      else {
      console.log("failure")
      alert('Didnt work');
      }
    }

function xycheck(position){
  console.log("Latitude:" + position.coords.latitude + "<br>" + "Longitude:" + position.coords.longitude)



  //var myicon = L.icon({
  //iconUrl: "{% static 'shops/img/my-icon.png' %}",
  //iconSize: [30, 30],
  //iconAnchor: [22, 94],
  //popupAnchor: [-3, -76],
  //});

  L.marker([parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)]).addTo(mymap)
  .bindPopup("Latitude:" + position.coords.latitude + "<br>" + "Longitude:" + position.coords.longitude)
  .openPopup();
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

//ajax
$(document).ready(function() {
    $.ajax({
        method: 'POST',
        url: '/path/to/your/view/',
        data: {'yourJavaScriptArrayKey': yourJavaScriptArray},
        success: function (data) {
             //this gets called when server returns an OK response
             alert("it worked!");
        },
        error: function (data) {
             alert("it didnt work");
        }
    });
});
