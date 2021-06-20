var markers = new Set(); //empty array
var marker, i;
//homepage map
$(document).ready(function() {
  var currentVenue = "";
  //Google Maps API setup
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
  script.defer = true;
 

  window.initMap = function() {

    if (navigator.geolocation) {
      console.log("Success! User location is available");
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
        const userMapCentre = {
          lat: userLat,
          lng: userLong
        };

        //create map and centre on user
        map = new google.maps.Map(document.getElementById('map'), {
          center: userMapCentre,
          zoom: 15,
          mapId: '33df39eac4360b95',
          disableDefaultUI: true
        });
        console.log("Map Done. User location is " + [userLat + userLong]);
        showUserLists()
      }
    }

    //create geocoder
    const geocoder = new google.maps.Geocoder();

    //search address 
    document.getElementById("submit").addEventListener("click", () => {
      addressLookup(geocoder, map);
    });

    //search area
    document.getElementById("area-search").addEventListener("click", () => {
      console.log("Clicked!");
      getVenues(map)
      toggleNav()
    });

    $("#friends").click(function() {
      console.log("friends")
      getFriends(map)
    });

    //view promotions
    $("#view-promotions").click(function() {
      getNearbyPromotions(map)
    });

    //filter box
    $("#search-filter").keyup(function() {
      const searchTerm = $("#search-filter").val();

      // Don't want to search if only a few characters
      if (searchTerm.length < 2) {
        if (searchTerm.length === 0) {
          // Deleted search term so remove everything
          $("#search-filter").empty()
        }
        return // don't need to do anything else
      }
      filter(geocoder, marker, map)
    });
  }
  document.head.appendChild(script);
  

document.getElementById("createList").addEventListener("click", () => {
  console.log("Create list clicked on")
  createNewList()
});



const filter = function(geocoder, marker, map) {
    $("#filter-results").empty()
    let searchTerm = $("#search-filter").val();
    $.ajax({
      type: 'GET',
      url: '/electra/filter/',
      data: {
        'search_term': searchTerm
      },
      success: function(data) {
        data.forEach(([filter]) => {
          var filter = filter;
          var searchList = $(
            `<div>
                      <li class="search-list-item" data-idtext="${filter}" id="${filter}">${filter}</li>
                  </div>`
          );
          searchList.appendTo('#filter-results');
        });

        let filterList = []
        $('#filter-results').click(function(event) {
          var filter = event.target.id;
          $('#filter-results').empty()
          filterList.push(filter)
          console.log(filterList)
          filterList.forEach((filter) => {
            var filterCol = $('<div id="filter-col"></div>');
            var filterPanel = $(
              `
              <div class="card filter-card m-3">
                <div class="card card-body" id="${filter}-cardbody" data-idtext="${filter}">
                  ${filter}
                </div>
              </div>
            `
            );

            filterPanel.appendTo(filterCol);
            filterCol.appendTo('#filterCardList');

          // getVenueDetails(selectedVenue, geocoder, marker, map)
        });
      })
    }
  });
};



//userlists functionality
//displays lists in sidebar
const showUserLists = function(map) {
  $.ajax({
    type: 'GET',
    url: '/api/userlist/',
    data: {},
    success: function(data) {
      data.forEach(item => {
        var listName = item.list_name;
        var listId = item.id;
        console.log(`Loaded ${listName}:${listId}`)
        $("#userLists").append(
          `<li class="userlist" id="${listName}" data-name="${listName}" data-pk="${listId}">
            ${listName}
              <i id="dropdown" class="ml-4 dropdown fas fa-ellipsis-h" type="button" data-toggle="dropdown"></i>
              <div class="dropdown-menu dropdown-menu-left" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" id="${listName}-edit" data-name="${listName}" data-pk="${listId}">Edit List</a>
                <a class="dropdown-item" id="${listName}-share" data-name="${listName}" data-pk="${listId}">Share</a>
                <a class="dropdown-item" id="${listName}-delete" data-name="${listName}" data-pk="${listId}">Delete</a>    
          </li>
          `)
          // edits list
          document.getElementById(listName + "-edit").addEventListener('click', function(e) {
            if (e.target && e.target.matches("a.dropdown-item")) {
              e.stopPropagation();             
              clickedList = e.target.getAttribute('data-name')
              clickedListId = e.target.getAttribute('data-pk')
              console.log(clickedList, clickedListId)

              editList(clickedListId, clickedList)            
            }   
          });
          // deletes list
          document.getElementById(listName + "-delete").addEventListener('click', function(e) {
            if (e.target && e.target.matches("a.dropdown-item")) {
              e.stopPropagation();
              console.log(e.target.id)
              clickedList = e.target.getAttribute('data-name')
              clickedListId = e.target.getAttribute('data-pk')
              deleteList(clickedListId, clickedList)
            }
          }); 
                
      })
    }
  });
};

//create new list
const createNewList = function(){
  console.log("creating a new list")
  $("#newlistmodal").modal('show');
}

$("#createListModal").click(function() {
  createNewList()
});

$("#save-list").click(function() {
  var listName = $("#newListName").val();
  console.log(listName)
  $.ajax({
    type: 'POST',
    url: '/api/userlist/',
    data: {
    csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
    'list_name' : listName
    },
    success: function(data) {
      console.log(data.instance_id)
      var listId = data.instance_id;
      $("#newlistmodal").modal('hide');
        $("#userLists").append(
          `<li class="userlist" id="${listName}" data-name="${listName}" data-pk="${listId}">
            ${listName}
              <i id="dropdown" class="ml-4 dropdown fas fa-ellipsis-h" type="button" data-toggle="dropdown"></i>
              <div class="dropdown-menu dropdown-menu-left" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" id="${listName}-edit" data-name="${listName}" data-pk="${listId}">Edit List</a>
                <a class="dropdown-item" id="${listName}-share" data-name="${listName}" data-pk="${listId}">Share</a>
                <a class="dropdown-item" id="${listName}-delete" data-name="${listName}" data-pk="${listId}">Delete</a>    
          </li>
          `)
      $("#userLists").html("");
      showUserLists();
    }
  });
});

  document.getElementById("save-edited-list").addEventListener('click', function() {
    let listName = document.getElementById("editListName").value;
    saveEditedList(clickedListId, listName)
  });

  const saveEditedList = function(clickedListId, listName) {
    console.log(clickedListId, listName)
    $.ajax({
      type: 'POST',
      url: '/electra/update_list_name/',
      data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'id' : clickedListId,
      'list_name' : listName
      },
      success: function(data) {
        console.log(data)
        console.log(data.instance_id)
        var listId = data.instance_id;

        $("#newlistmodal").modal('hide');
          $("#userLists").html("");
          showUserLists();
      }
    });
  }

//edit list
const editList = function(clickedListId, clickedList){
  $("#editListModal").modal('show');
  $("#editListLabel").text(`Edit ${clickedList}`)
  // $('#editListName').val(clickedList);
}

//deletelist
const deleteList = function(clickedListId, clickedList){
  let trashedList = [clickedListId, clickedList]
  console.log(trashedList)
  $.ajax({
    type: 'DELETE',
    url: `/api/deletelist/${clickedListId}`,
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value
    },
    success: function(data) {
        $("#userLists").html("");
        showUserLists();
        showDeleteSuccessSnackBar();
    }  
  });
}

$(window).resize(function() {
  // This will fire each time the window is resized:
  if($(window).width() >= 1024) {
      // if larger or equal
      $('#mySidebar').show();
  } else {
      // if smaller
      $('#mySidebar').hide();
  }
})
//shows clicked list's venues on map
$("#userLists").on('click', "li", function(e) {
  var listName = e.target.getAttribute('data-name');
  var listId = e.target.getAttribute('data-pk');
  console.log(`Clicked ${listName}:${listId}`);
  getClickedListVenues(listId)
  toggleNav()
  e.preventDefault();
});

const getClickedListVenues = function(listId) {
  console.log(`Getting Data from ${listId}`);
  $.ajax({
    type: 'GET',
    url: '/api/savedvenues/',
    data: {
      'list_id': listId
    },
    success: function(data) {
      addClickedListMarkersToMap(data, map,listId)
    }
  });
};

//search address feature
//searches address
function addressLookup(geocoder, resultsMap) {
  let bounds = resultsMap.getBounds();
  let address = document.getElementById("search").value; //gets user entry in address box
  geocoder.geocode({
    bounds: bounds,
    address: address
  }, (results, status) => {
    if (status === "OK") {
      resultsMap.setCenter(results[0].geometry.location);
      getVenues(map) //also used for search area
    }
  })
}

//gets venues from DB based on geographic bounds for search
function getVenues(map) {
  const lat0 = parseFloat(map.getBounds().getNorthEast().lat());
  const lng0 = parseFloat(map.getBounds().getNorthEast().lng());
  const lat1 = parseFloat(map.getBounds().getSouthWest().lat());
  const lng1 = parseFloat(map.getBounds().getSouthWest().lng())

  $.ajax({
    type: 'GET',
    url: '/electra/marker_info/',
    data: {
      'neLat': lat0,
      'neLng': lng0,
      'swLat': lat1,
      'swLng': lng1
    },
    success: function(data) {
      console.log(data)
      addSearchedMarkersToMap(data, map)
    }
  });
};

function getFriends(map) {
  const lat0 = parseFloat(map.getBounds().getNorthEast().lat());
  const lng0 = parseFloat(map.getBounds().getNorthEast().lng());
  const lat1 = parseFloat(map.getBounds().getSouthWest().lat());
  const lng1 = parseFloat(map.getBounds().getSouthWest().lng())

  $.ajax({
    type: 'GET',
    url: '/electra/get_friends/',
    data: {
      'neLat': lat0,
      'neLng': lng0,
      'swLat': lat1,
      'swLng': lng1
    },
    success: function(data) {
      console.log(data)
      addSearchedMarkersToMap(data, map)
    }
  });
};

var searchedCafeNamesList = []
var clickedListCafeNamesList = []
var markers = []

const addSearchedMarkersToMap = function(data, map) {
  searchedCafeNamesList = []
  clearMarkers()
  $("#indexCardList").empty()
  for (i = 0; i < data.length; i++) { //puts markers in the markers set
    searchedCafeNamesList.push(data[i][0]);
  };
  console.log(searchedCafeNamesList)
  gatherSearchedMarkerData(searchedCafeNamesList, map)
};

    const gatherSearchedMarkerData = function(listOfCafes, map, listId) {
      for (i = 0; i < listOfCafes.length; i++) {
        cafeName = listOfCafes[i];
        $.ajax({
          type: 'GET',
          url: '/electra/getUserMarkers/',
          data: {
            'cafeName': cafeName,
          },
          success: function(data) {
            console.log(data)
            putSearchedMarkersOnMap(data, map, listId)
          }
        });
      }
    };
    
    const putSearchedMarkersOnMap = function(data, map, listId) {
      const svgMarker = {
        path:
        "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
        fillColor: "grey",
        fillOpacity: 1,
        strokeWeight: 1.2,
        rotation: 0,
        scale: 1.8,
        anchor: new google.maps.Point(15, 30),
      };
    
      const selectedSvgMarker = {
        path:
        "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
        fillColor: "#e4324c",
        fillOpacity: 1,
        strokeWeight: 1.2,
        rotation: 0,
        scale: 1.8,
        anchor: new google.maps.Point(15, 30),
      };
    
    
      for (let i = 0; i < data.length; i++) {
        console.log(data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
        const marker = new google.maps.Marker({
          position: new google.maps.LatLng(data[i][2], data[i][3]),
          map: map,
          animation: google.maps.Animation.DROP,
          title:data[i][0],
          icon:svgMarker
        });
        
        markers.push(marker)
        
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
                <div class="venue-card card card-block m-3 overflow-auto" style="width: 18rem;">
                  <div class="venue-card card card-body" id="${cafeName}-cardbody" data-idtext="${cafeName}">
                    <h5 class="card-title venue-name" id="${cafeName}-card">
                      <a href="venue/${cafeId}" id="${cafeName}-link" data-idtext="${cafeName}" class="card-link" target="_blank" rel="noreferrer noopener">${cafeName}</a>
                    </h5>
                    <h6 class="card-subtitle mb-2 text-muted venue-address"></h6>
                    <div class="dropdown">
                      <div class="venue-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></div>
                      <div id="${cafeName}-dropdown" class="venue-card-dropdown dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <a id="share ${cafeName}" data-idtext="share-${cafeName}" class="dropdown-item" href="#">Share</a>
                        <a id="add ${cafeName}" data-idtext="${cafeId}" class="dropdown-item add" href="#">Add to List</a>
                    </div>
                  </div>
                </div>
              </div>
              `
              );
              $(".venue-address", myPanel).html(cafeAddress);
              $(".venue-options", myPanel).html('<i id="test" class="fas fa-ellipsis-h"></i>');
              myPanel.appendTo(myCol);
              myCol.appendTo('#indexCardList');
    
              document.getElementById(cafeName + "-dropdown").addEventListener('click', function(e) {
                if (e.target && e.target.matches("a.add")) {
                  console.log(e.target.id)
                  currentVenue = e.target.getAttribute('data-idtext')
                  addToListModal(currentVenue)
                };
              });
    
              document.getElementById(cafeName + "-dropdown").addEventListener('click', function(e) {
                if (e.target && e.target.matches("a.remove")) {
                  console.log(e.target.id)
                  currentVenue = e.target.getAttribute('data-idtext')
                  removeFromListModal(currentVenue, listId)
                };
              });
    
        marker.addListener("click", () => {
          let cards = document.getElementsByClassName('venue-card card card-body');
          console.log(cards)
          for (i = 0; i < cards.length; i++) {
            console.log(cards[i])
            if (cards[i].classList.contains('selected-card')){
              cards[i].classList.remove("selected-card");
            }
          };
          
          for (i = 0; i < markers.length; i++) { 
            markers[i].setIcon(svgMarker);
            };
          scrollToCard()
        });
    
        const scrollToCard = function(){
          
          map.panTo(marker.getPosition())
          map.setZoom(15);
          let clickedMarker = marker.title
          console.log(clickedMarker);
          let venues = document.getElementsByClassName('card-title venue-name');
            for (i = 0; i < venues.length; i++) {
              if (venues[i].innerText == clickedMarker) {
                
                marker.setIcon(selectedSvgMarker);
                let matchedMarker = venues[i].innerText
                console.log('Found match: ' + matchedMarker)

                markersCard = document.getElementById(`${matchedMarker}-cardbody`);
                
                markersCard.classList.add("selected-card")
                markersCard.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
              };   
            }
        }
    
        const panToMarker = function(clickedCard, markers){
          console.log(clickedCard);
          console.log(markers)
            for (i = 0; i < markers.length; i++) {
              if (markers[i].title == clickedCard) {
                let matchedMarker = markers[i];
                marker.setIcon(selectedSvgMarker);
                map.panTo(matchedMarker.getPosition())
                map.setZoom(15);
              };   
            }
        };
              //user clicks card, pan to marker
              document.getElementById(`${cafeName}-cardbody`).addEventListener('click', function(e) {
                  clickedCard = e.target.getAttribute('data-idtext')
                  console.log(clickedCard)
    
                  for (i = 0; i < markers.length; i++) { 
                    markers[i].setIcon(svgMarker);
                    };
                  panToMarker(clickedCard, markers, data)
              });
            });
          }
        });
        map.setCenter(new google.maps.LatLng(data[0][2], data[0][3]));
        map.setZoom(14)
      }
    };
    
    // const clearMarkers = function(map) {
    //   for (let i = 0; i < markers.length; i++) {
    //     markers[i].setMap(null);
    //   };
    // };

const addClickedListMarkersToMap = function(data, map, listId) {
  clickedListCafeNamesList = []
    clearMarkers()
    $("#indexCardList").empty()
      for (i = 0; i < data.length; i++) { //puts markers in the markers set
        clickedListCafeNamesList.push(data[i].venue.cafe_name);
      };
      console.log(clickedListCafeNamesList)
      gatherListMarkerData(clickedListCafeNamesList, map, listId)
    };
    
const gatherListMarkerData = function(listOfCafes, map, listId) {
  for (i = 0; i < listOfCafes.length; i++) {
    cafeName = listOfCafes[i];
    $.ajax({
      type: 'GET',
      url: '/electra/getUserMarkers/',
      data: {
        'cafeName': cafeName,
      },
      success: function(data) {
        console.log(data)
        putListMarkersOnMap(data, map, listId)
      }
    });
  }
};

const putListMarkersOnMap = function(data, map, listId) {
  const svgMarker = {
    path:
    "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    fillColor: "grey",
    fillOpacity: 1,
    strokeWeight: 1.2,
    rotation: 0,
    scale: 1.8,
    anchor: new google.maps.Point(15, 30),
  };

  const selectedSvgMarker = {
    path:
    "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    fillColor: "#e4324c",
    fillOpacity: 1,
    strokeWeight: 1.2,
    rotation: 0,
    scale: 1.8,
    anchor: new google.maps.Point(15, 30),
  };


  for (let i = 0; i < data.length; i++) {
    console.log(data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(data[i][2], data[i][3]),
      map: map,
      animation: google.maps.Animation.DROP,
      title:data[i][0],
      icon:svgMarker
    });
    
    markers.push(marker)
    
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
            <div class="venue-card card card-block m-3 overflow-auto" style="width: 18rem;">
              <div class="venue-card card card-body" id="${cafeName}-cardbody" data-idtext="${cafeName}">
                <h5 class="card-title venue-name" id="${cafeName}-card">
                  <a href="venue/${cafeId}" id="${cafeName}-link" data-idtext="${cafeName}" class="card-link" target="_blank" rel="noreferrer noopener">${cafeName}</a>
                </h5>
                <h6 class="card-subtitle mb-2 text-muted venue-address"></h6>
                <div class="dropdown">
                  <div class="venue-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></div>
                  <div id="${cafeName}-dropdown" class="venue-card-dropdown dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <a id="share ${cafeName}" data-idtext="share-${cafeName}" class="dropdown-item" href="#">Share</a>
                    <a id="add ${cafeName}" data-idtext="${cafeId}" class="dropdown-item add" href="#">Add to List</a>
                    <a id="remove ${cafeName}" data-idtext="${cafeId}" class="dropdown-item remove" href="#">Remove from List</a></div>
                </div>
              </div>
            </div>
          </div>
          `
          );
          $(".venue-address", myPanel).html(cafeAddress);
          $(".venue-options", myPanel).html('<i id="test" class="fas fa-ellipsis-h"></i>');
          myPanel.appendTo(myCol);
          myCol.appendTo('#indexCardList');

          document.getElementById(cafeName + "-dropdown").addEventListener('click', function(e) {
            if (e.target && e.target.matches("a.add")) {
              console.log(e.target.id)
              currentVenue = e.target.getAttribute('data-idtext')
              addToListModal(currentVenue)
            };
          });

          document.getElementById(cafeName + "-dropdown").addEventListener('click', function(e) {
            if (e.target && e.target.matches("a.remove")) {
              console.log(e.target.id)
              currentVenue = e.target.getAttribute('data-idtext')
              removeFromListModal(currentVenue, listId)
            };
          });

    marker.addListener("click", () => {
      for (i = 0; i < markers.length; i++) { 
        markers[i].setIcon(svgMarker);
        };
      let cards = document.getElementsByClassName('venue-card card card-body');
      console.log(cards)
      for (i = 0; i < cards.length; i++) {
        console.log(cards[i])
        if (cards[i].classList.contains('selected-card')){
          cards[i].classList.remove("selected-card");
        }
      };
      scrollToCard()
    });

    const scrollToCard = function(){
      map.panTo(marker.getPosition())
      map.setZoom(15);
      let clickedMarker = marker.title
      console.log(clickedMarker);
      let venues = document.getElementsByClassName('card-title venue-name');
        for (i = 0; i < venues.length; i++) {
          if (venues[i].innerText == clickedMarker) {
            marker.setIcon(selectedSvgMarker);
            let matchedMarker = venues[i].innerText
            console.log('Found match: ' + matchedMarker)
            markersCard = document.getElementById(`${matchedMarker}-cardbody`);
            markersCard.classList.add("selected-card")
            markersCard.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
          };   
        }
    }

    const panToMarker = function(clickedCard, markers){
      console.log(clickedCard);
      console.log(markers)
        for (i = 0; i < markers.length; i++) {
          if (markers[i].title == clickedCard) {
            let matchedMarker = markers[i];
            marker.setIcon(selectedSvgMarker);
            map.panTo(matchedMarker.getPosition())
            map.setZoom(15);
          };   
        }
    };
          //user clicks card, pan to marker
          document.getElementById(`${cafeName}-cardbody`).addEventListener('click', function(e) {
              clickedCard = e.target.getAttribute('data-idtext')
              console.log(clickedCard)

              for (i = 0; i < markers.length; i++) { 
                markers[i].setIcon(svgMarker);
                };
              panToMarker(clickedCard, markers, data)
          });
        });
      }
    });
    map.setCenter(new google.maps.LatLng(data[0][2], data[0][3]));
    map.setZoom(14)
  }
};

const clearMarkers = function(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  };
};

const addToListModal = function(venueName) {
  var userName = document.getElementById("username").innerText;
  console.log(userName);
  console.log(venueName);
  $("#userListsModal").empty();
  $('#userlist-modal').modal('show');
  $.ajax({
    type: 'GET',
    url: '/api/userlist/',
    data: {
      'username': userName
    },
    success: function(data) {
      console.log(data)
      data.forEach(item => {
        var listName = item.list_name;
        var listId = item.id;
        console.log(listName)
        console.log(listId)
        var listItem = $("#userListsModal").append(
          `<li class="userlistModal" id="${listName}" 
                  data-name="${listName}" data-pk="${listId}">
                    ${listName}
                </li>`)
      });
    }
  });
};

$("#userListsModal").on('click', "li", function(e) {
  var listname = e.target.getAttribute('data-name');
  var listId = e.target.getAttribute('data-pk');
  console.log(`Adding ${currentVenue} to ${listname}:${listId}`);
  addVenueToList(listId, currentVenue);
  e.preventDefault();
});


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

const addVenueToList = function(listId, venue) {
  console.log(venue);
  console.log(listId);

  $.ajax({
    type: "POST",
    url: '/api/uservenue/',
    dataType: 'json',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'user_list': listId,
      'venue': venue
    },
    success: function(data) {
      $("#userlist-modal").modal('hide');
      showSnackBar()
    },
  });
};

const removeFromListModal = function(venueName, listId) {
  var userName = document.getElementById("username").innerText;
  console.log(userName);
  console.log(venueName);
  console.log(listId);
  $('#remove-venue-from-list-modal').modal('show');
  $("#remove-text").html(`Are you sure you want to remove ${venueName}?`);
  $("#remove-venue-button").click(function(){
    console.log("clicked remove")
    $('#remove-venue-from-list-modal').modal('hide');
    removeVenueFromList(venueName, listId);
  })
};

const removeVenueFromList = function(venueName, listId){
  $.ajax({
    type: 'GET',
    url: '/electra/remove_venue_from_list',
    data: {
      // csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value
      'user_list': listId,
      'venue': venueName
    },
    success: function(data) {
        console.log("removed")
        getClickedListVenues(listId);
        showRemovedSuccessSnackBar();
    }  
  });

}

const getNearbyPromotions = function(map) {
  const lat0 = parseFloat(map.getBounds().getNorthEast().lat());
  const lng0 = parseFloat(map.getBounds().getNorthEast().lng());
  const lat1 = parseFloat(map.getBounds().getSouthWest().lat());
  const lng1 = parseFloat(map.getBounds().getSouthWest().lng())

  $.ajax({
    type: 'GET',
    url: '/api/promotion/',
    data: {
      'neLat': lat0,
      'neLng': lng0,
      'swLat': lat1,
      'swLng': lng1
    },
    success: function(data) {
      console.log(data)
    }
  });
};

// document.getElementById("dashboard").addEventListener('click', function() {
//   var user = document.getElementById("username").innerText;
  
//   viewDashboard(user);
// });

const viewDashboard = function(user) {
  console.log("Going to the Dashboard of:" + " " + user);
  userName = "/" + user;
  window.location.href = userName;
};

// $("#profile").click(function() {
//   console.log("clicked profile")
//   showProfileModal()
// });

$("#username").click(function() {
  console.log("clicked profile")
  showProfileModal()
});

const showProfileModal = function() {
  $("#profile-modal").modal('show');
};

// document.getElementById("edit-profile").addEventListener('click', function() {
//   console.log("click")
//   $("#edit-profile-modal").modal('show');
// })

});

// feedback modal
$("#feedback").click(function(){
  $("#feedback-modal").modal('show'); 
})

$("#submit-feedback").click(function(){
  let user = $("#feedback-name").val();
  let typeOfFeedback = $("#feedback-type").val();
  let description = $("#feedback-description").val();
  console.log(user)
  sendFeedback(typeOfFeedback, description)
})

const sendFeedback = function(typeOfFeedback, description) {
  console.log(typeOfFeedback + " " + description)
  $.ajax({
    type: 'POST',
    url: '/electra/feedback/',
    data: {
    csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
    'feedback_type' : typeOfFeedback,
    'feedback_content' : description
    },
    success: function(data) {
     console.log("All good, sent")
    }
  });
};

$("#suggest-place").click(function(){
  $("#suggestion-modal").modal('show'); 
})

$("#submit-suggestion").click(function(){
  let user = $("#suggestor").val();
  let venueName = $("#suggestion-name").val();
  let venueType = $("#venue-type").val();
  let venueAddress = $("#suggestion-address").val();
  sendSuggestion(venueName, venueType, venueAddress)
})

const sendSuggestion = function(venueName, venueType, venueAddress) {
  console.log(venueName + " " + venueType + " " + venueAddress)
  $.ajax({
    type: 'POST',
    url: '/electra/suggestion/',
    data: {
    csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
    'venue_name' : venueName,
    'venue_type' : venueType,
    'venue_address' : venueAddress
    },
    success: function(data) {
      $("#suggestion-modal").modal('show');
      showSnackBar()
    }
  });
};


function showSnackBar() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function showDeleteSuccessSnackBar() {
  // Get the snackbar DIV
  var x = document.getElementById("deleteSuccessSnackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function showRemovedSuccessSnackBar() {
  // Get the snackbar DIV
  var x = document.getElementById("venueRemovedSuccessSnackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

$("#openbtn").click(function(){
  toggleNav()
});

const toggleNav = function(){
  let sideBar = $("#mySidebar")
  let openBtn = $(".openbtn")
  let mapCards = $(".map-venue-cards")
    if (sideBar.hasClass("closed-sidebar"))
    {
      sideBar.removeClass("closed-sidebar")
      sideBar.addClass("open-sidebar")
      openBtn.addClass("pushedbtn")
      mapCards.addClass("pushedcards")
     
    }
    else {
      sideBar.removeClass("open-sidebar")
      sideBar.addClass("closed-sidebar")
      openBtn.removeClass("pushedbtn")
      mapCards.removeClass("pushedcards")

    };
}


// /* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
// function closeNav() {
//   document.getElementById("mySidebar").style.width = "0";
//   document.getElementById("main").style.marginLeft = "0";
// }

