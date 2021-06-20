var markers = new Set(); //empty array
var marker, i;
//homepage map
$(document).ready(function() {

//Google Maps API setup
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
script.defer = true;

  window.initMap = function() {

  if (navigator.geolocation) {
    console.log("Success");

    navigator.geolocation.getCurrentPosition(showPosition, catchError, positionOptions);

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

      //Once geolocation is detected: get the user's position.
      function showPosition(position) {
        const userLat = parseFloat(position.coords.latitude);
        const userLong = parseFloat(position.coords.longitude);
        const userMapCentre = {lat: userLat, lng: userLong};
        
        console.log("User location is " + [userLat + userLong]);
        
        //create map and centre on user
        map = new google.maps.Map(document.getElementById('dashMap'), { 
          center: userMapCentre, 
          zoom: 15,
          mapId: '33df39eac4360b95'
        });
        showUserLists(map)
      }
    }
  }
  document.head.appendChild(script);
})

const showUserLists = function(map){
 
  $.ajax({
    type: 'GET',
    url: '/api/userlist/',
    data: {
    },
    success: function(data) {
      data.forEach(item => {
        var listName = item.list_name;
        var listId = item.id;
        console.log(`Loaded ${listName}:${listId}`)
        $("#userLists").append(
          `<li class="userlist" id="${listName}" data-name="${listName}" data-pk="${listId}">
            ${listName}
              <i class="ml-4 dropdown fas fa-ellipsis-h" type="button" data-toggle="dropdown"></i>
              <div class="dropdown-menu dropdown-menu-left" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" id="edit-list">Edit List</a>
                <a class="dropdown-item" id="share-list">Share</a>
                <a class="dropdown-item" id="delete-list">Delete</a>    
          </li>
          `)
        })
      }
    });  
};

// document.getElementById('userLists').addEventListener('click', function(e) {
//   if (e.target && e.target.matches("li.userlist")) {
//     var listName = e.target.getAttribute('data-name');
//     var listId = e.target.getAttribute('data-pk');
//     console.log(listName + " " + listId)
//     getTableData(listName, listId)
//   }
// })

$("#userLists").on('click', "li", function(e) {
  var listName = e.target.getAttribute('data-name');
  var listId = e.target.getAttribute('data-pk');
  console.log(`Clicked ${listName}:${listId}`);
  getTableData(listName, listId)
  e.preventDefault();
  });

const getTableData = function(listname, listId){
  console.log(`Filling Table...`);
  $.ajax({
      type: 'GET',
      url: '/api/savedvenues/',
      data: {
        'list_id':listId
      },
      success: function (data) {
        data.forEach(item => { 
          })
          fillTable(data, map)
        }
      });
};

var cafeNamesList = []

const fillTable = function (data){
  const table = document.getElementById("dashboardTableBody");
  for (i = 0; i < data.length; i++) {
    let row = table.insertRow();
    let name = row.insertCell(0);
    name.innerHTML = data[i].venue.cafe_name; 
    name.id = data[i].venue.cafe_name; 
    name.classList.add('table_data');
    cafeName = name.innerHTML;
    cafeNamesList.push(cafeName);
    let location = row.insertCell(1);
    location.innerHTML = data[i].venue.cafe_address;
    location.id = data[i].venue.cafe_address; 
    location.classList.add('table_data');
    let type = row.insertCell(2);
    type.classList.add('table_data');
    type.innerHTML = data[i].venue.venue_type;
    let options = row.insertCell(3);
    options.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    options.id = "options";
  }
  gatherMarkerData(cafeNamesList, map)
}

const gatherMarkerData = function(cafeNamesList, map) {
  for (i = 0; i < cafeNamesList.length; i++){
    cafeName = cafeNamesList[i];
      $.ajax({
        type: 'GET',
        url: '/electra/getUserMarkers/',
        data: {
          'cafeName': cafeName,
        },
        success: function (data) {
            putMarkersOnMap(data, map)
          }
        });
  }
}

markers = []
const putMarkersOnMap = function(data, map){
  for (i = 0; i < data.length; i++) {
    console.log(data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(data[i][2], data[i][3]),
      map: map,
      animation: google.maps.Animation.DROP
    });

    $.ajax({
      type: 'GET',
      url: '/electra/info_box/',
      data: {
        'venuename': data[i][0]
      },
      success: function(data) {
        data.forEach(([cafeId, cafeName, cafeAddress]) => {
          var myCol = $('<div id="col"></div>');
          var myPanel = $(
            `
              <div class="card-group">
              <div class="card card-block m-3 overflow-auto" style="width: 18rem;">
                <div class="card-body">
                  <h5 class="card-title venue-name" id="${cafeName}"><a href="venue/${cafeId}" target="_blank" rel="noreferrer noopener">${cafeName}</a></h5>
                  <h6 class="card-subtitle mb-2 text-muted venue-address"></h6>
                  <div class="dropdown">
                    <div class="venue-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></div>
                    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton"><a id="share" class="dropdown-item" href="#">Share</a><a id="addToListNoModal" class="dropdown-item" href="#">Add to List</a></div>
                  </div>
                </div>
              </div>
            </div>
            `
          );
          $(".venue-name", myPanel).html(cafeName);
          $(".venue-address", myPanel).html(cafeAddress);
          // $(".venue-description", myPanel).html(cafeDescription);
          $(".share", myPanel).html('<i class="fas fa-share-alt"></i>', myPanel);
          $(".venue-options", myPanel).html('<i class="fas fa-ellipsis-h"></i>');
          myPanel.appendTo(myCol);
          myCol.appendTo('#dashCardList');
        });

      }
    });

    map.setCenter(new google.maps.LatLng(data[0][2], data[0][3]));
    map.setZoom(14)
  }
}
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    

  }
}

$("#username").click(function(){
  console.log("clicked profile")
  showProfileModal()
});

const showProfileModal = function(){
  $("#profile-modal").modal('show');
};

document.getElementById("edit-profile").addEventListener('click', function() {
  console.log("click")
  $("#edit-profile-modal").modal('show');
});

document.getElementById("dashboard").addEventListener('click', function() {
  var user = document.getElementById("username").innerText;
  console.log(user)
  viewDashboard(user);
});