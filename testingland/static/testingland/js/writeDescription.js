var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
script.defer = true;

window.initMap = function() {
  console.log("Loaded");

  //google API Assets
  //map
  const map = new google.maps.Map(document.getElementById("addMap"), {
    center: {
      lat: -34.397,
      lng: 150.644
    },
    zoom: 8,
  });

  //marker
  const marker = new google.maps.Marker({
    position: {
      lat: -34.397,
      lng: 150.644
    },
    map: map
  })

  //geocoder
  const geocoder = new google.maps.Geocoder();

  document.getElementById("get_cafe").addEventListener("click", () => {
    console.log("Clicked!")
    getCafe();
  })

  document.getElementById("search_cafe").addEventListener("click", () => {
    console.log("Clicked!")
    getSearchedCafe();
  })


  $("#search-box").keyup(function() {
    const searchTerm = document.getElementById("search-box").value;

    // Don't want to search if only a few characters
    if (searchTerm.length < 2) {
      if (searchTerm.length === 0) {
        // Deleted search term so remove everything
        $("#search-results").empty()
      }
      return // don't need to do anything else
    }
    search(geocoder, marker, map)
  });

  document.getElementById("geocode").addEventListener("click", () => { 
    console.log("Clicked!")
    geocodeCafeAddress(geocoder, marker, map);
  })

  document.getElementById("create").addEventListener("click", () => {
    console.log("Clicked Save!")
    commitNewCafe();
  })

  document.getElementById("update").addEventListener("click", () => {
    console.log("Clicked Update!")
    updateCafe();
  })
}
document.head.appendChild(script);


$(document).ready(function() {
  console.log("Welcome to Add Venue World");
});

const search = function(geocoder, marker, map) {
  $("#search-results").empty()
  let searchTerm = document.getElementById("search-box").value;
  $.ajax({
    type: 'GET',
    url: '/electra/search/',
    data: {
      'search_term': searchTerm
    },
    success: function(data) {
      data.forEach(([cafeName]) => {
        var cafeName = cafeName;
        var searchList = $(
          `<div>
                    <li class="search-list-item" data-idtext="${cafeName}" id="${cafeName}">${cafeName}</li>
                </div>`
        );
        searchList.appendTo('#search-results');
      });

      $("#search-results").click(function(event) {
        var selectedVenue = event.target.id;
        $("#search-results").empty()
        console.log("Clicked" + " " + selectedVenue);
        getVenueDetails(selectedVenue, geocoder, marker, map)
      });
    }
  });
};

const getVenueDetails = function(selectedVenue, geocoder, marker, map) {
  $.ajax({
    type: 'GET',
    url: '/electra/get_searched_venue_details/',
    data: {
      'venuename': selectedVenue
    },
    success: function(data) {
      console.log(data)
      let venueName = data[0][1]
      let venueAddress = data[0][2]
      let venueDescription = data[0][3]
      let venueLatitude = data[0][4]
      let venueLongitude = data[0][5]
      $('#cafe-name-div').html(venueName);
      $('#venue-name-box').val(venueName);
      $('#venue-address-box').val(venueAddress);
      $('#description-box').val(venueDescription);
      $("#latitude").val(venueLatitude)
      $("#longitude").val(venueLongitude)
      geocodeCafeAddress(geocoder, marker, map)
    }
  });
};

const geocodeCafeAddress = function(geocoder, marker, map) {
  let address = document.getElementById("venue-address-box").value;
  console.log(address)
  geocoder.geocode({
    address: address
  }, (results, status) => {
    if (status === "OK") {
      console.log("Successfully geocoded address input");
      var geolat = parseFloat(results[0].geometry.location.lat());
      var geolong = parseFloat(results[0].geometry.location.lng());
      var geoloc = [geolat, geolong];
      $("#latitude").val(geolat)
      $("#longitude").val(geolong)
      console.log("The geocoordinates of searched address are " + geoloc);
      changeMarkerPosition(geolat, geolong, marker, map)
    };
  })
}

const changeMarkerPosition = function(geolat, geolong, marker, map) {
  marker.setPosition(new google.maps.LatLng(geolat, geolong));
  map.setCenter(marker.getPosition());
  map.setZoom(15)
};


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

const commitNewCafe = function() {
  let name = $("#venue-name-box").val()
  let address = $("#venue-address-box").val()
  let latitude = $("#latitude").val()
  let longitude = $("#longitude").val()
  let type = $("#venue-type-box").val()
  let description = $("#description-box").val()


  $.ajax({
    type: 'POST',
    url: '/add_cafe/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'venuename': name,
      'venueaddress': address,
      'latitude': latitude,
      'longitude': longitude,
      'venuetype': type,
      'venuedescription': description.replace(/\n/g, "<br>")
    },
    success: function(data) {
      console.log("Data sent");
      location.reload();
    }
  });
}

const updateCafe = function() {
  let name = $("#venue-name-box").val()
  let address = $("#venue-address-box").val()
  let latitude = $("#latitude").val()
  let longitude = $("#longitude").val()
  let type = $("#venue-type-box").val()
  let description = $("#description-box").val()
  console.log(name, address, latitude, longitude, type, description)

  $.ajax({
    type: 'POST',
    url: '/update_cafe/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'venuename': name,
      'venueaddress': address,
      'latitude': latitude,
      'longitude': longitude,
      'venuetype': type,
      'venuedescription': description.replace(/\n/g, "<br>")
    },
    success: function(data) {
      alert("Data sent");
      location.reload();
    }
  });
}
