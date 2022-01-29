var markerSet = new Set(); //empty array
var selectedPlaces = new Set()
var marker, i;
var service;
var searchedCafeNamesList = []
var clickedListCafeNamesList = []
var markers = []
var infowindows = []
var likedVenues = new Set(); //empty array
var markerStyles = []
var geocoder = undefined

//homepage map
$(document).ready(function() {

  //Google Maps API setup
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&libraries=places&callback=initMap&map_ids=33df39eac4360b95';
  script.defer = true;

  window.initMap = function() {
    //create geocoder
    geocoder = new google.maps.Geocoder();
    var svgMarker = {
      path: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
      fillColor: "lightgrey",
      fillOpacity: 1,
      strokeWeight: 1.2,
      rotation: 0,
      scale: 1.8,
      anchor: new google.maps.Point(15, 30),
    };

    var selectedSvgMarker = {
      path: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
      fillColor: "#E84A5F",
      fillOpacity: 1,
      strokeWeight: 1.2,
      rotation: 0,
      scale: 1.8,
      anchor: new google.maps.Point(15, 30),
    };

    markerStyles.push(svgMarker)
    markerStyles.push(selectedSvgMarker)

    console.log(markerStyles)
    const startVYGR = function() {
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
            openMapNoLocation();
            break;
          default:
            alert("An unknown error occurred.");
        }
      }

      const permissionDeniedModal = function() {
        $("#permissionDeniedModal").modal('show')
      }

      $("#permissionDeniedModalDone").click(function() {
        location.reload();
      });

      const openMapNoLocation = function() {
        console.log("No Location Provided")
        map = new google.maps.Map(document.getElementById('map'), {
          center: {
            lat: 35.6762,
            lng: 139.6503
          },
          zoom: 2,
          mapId: '33df39eac4360b95',
          disableDefaultUI: true,
          gestureHandling: 'greedy'
        });
      };

      $("#permissionDeniedModalDenied").click(function() {
        $("#permissionDeniedModal").modal('hide')
        map = new google.maps.Map(document.getElementById('map'), {
          center: {
            lat: -34.397,
            lng: 150.644
          },
          zoom: 6,
          mapId: '33df39eac4360b95',
          disableDefaultUI: true,
          gestureHandling: 'greedy'
        });
      });


      map = new google.maps.Map(document.getElementById('map'), {
        center: userMapCentre,
        zoom: 15,
        mapId: '33df39eac4360b95',
        disableDefaultUI: true,
        gestureHandling: 'greedy'
      });
      console.log("Map Done. User location is " + [userLat + userLong]);

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
          disableDefaultUI: true,
          gestureHandling: 'greedy'
        });
        console.log("Map Done. User location is " + [userLat + userLong]);

        const hideUI = function() {
          let userLists = $("#vygr-sidebar")
          $("#sideNav").css("left", "-23rem")
          $("#vygr-nav").css("top", "-23rem")
          if(userLists.hasClass("open-sidebar")){
            userLists.css("left", "-23rem")
          }
        }

        const showUI = function() {
          let userLists = $("#vygr-sidebar")
          $("#sideNav").css("left", "0rem")
          $("#vygr-nav").css("top", "0rem")
          if(userLists.hasClass("open-sidebar")){
            userLists.css("left", "0rem")
          }       
        }

        map.addListener("center_changed", hideUI)
        map.addListener("idle", showUI)

        if ($("#shared-list-id").length) {
          let list_id = $("#shared-list-id").val()
          console.log(`Shared list exists: ${list_id}`)
          getClickedListVenues(list_id)
        } else {
          console.log("Nothing here")
        }
      }
    }
    if (navigator.geolocation) {
      console.log("Navigator Geolocation Enabled")
      startVYGR()
    }
  }
  document.head.appendChild(script);
})

//modal buttons
$(".close").click(function() {
  $(".modal").modal('hide')

})

$(".closer").click(function() {
  $(".modal").modal('hide')
})


const switchSearchType = function() {
  $("#search-box").val('')
  let searchType = $("#search-type-icon")
  let searchInput = $('#search-box')
  if (searchType.hasClass("bi bi-geo-alt-fill")) {
    searchType.removeClass("bi bi-geo-alt-fill")
    searchType.addClass("bi bi-shop")
    searchInput.attr('placeholder', 'Search Place...');
  } else if (searchType.hasClass("bi bi-shop")) {
    searchType.removeClass("bi bi-shop")
    searchType.addClass("bi bi-geo-alt-fill")
    searchInput.attr('placeholder', 'Search Address...');
  }
};
$("#place").click(function() {
  switchSearchType()
});

$("#address").click(function() {
  switchSearchType()
});

$("#add").click(function() {
  console.log("Clicked Save!")
  commitNewCafe(geocoder)
});



//search address or venue 
$("#submit").click(function() {
  let searchType = $("#search-type-icon")
  if (searchType.hasClass("bi bi-geo-alt-fill")) {
    addressLookup(geocoder, map);
  } else if (searchType.hasClass("bi bi-shop")) {
    venueLookup()
  }
});


//search area
$("#area-search").click(function() {
  clearMarkers()
  let sideBar = $("#vygr-sidebar")
  let sideNav = $("#sideNav")
  if (sideBar.hasClass("open-sidebar")) {
    sideBar.removeClass("open-sidebar")
    sideBar.addClass("closed-sidebar")
    sideNav.removeClass("pushedbtn")
  };
  $("#userLists").html("");
  $(".venue-info-card").html("");
  getVenues(map)
});

$("#user-lists").click(function() {
  let loginButton = $("#login")
  if (loginButton.length) {
    $("#registerModal").modal("show")
    $("#registerText").html("")
    $("#registerText").append(
      `
        <ul>
          <li>This is where your lists will go, nice and neat, easy to view or share, all yours. Just gotta sign up or login!</li>
        </ul>
        `
    )
  } else if ($("#vygr-sidebar").hasClass("open-sidebar")) {
    toggleSideBar()
    closeNavButtons()
  } else {
    toggleSideBar()
    showUserLists()
  }
})


$("#createList").click(function() {
  console.log("Create list clicked on")
  let loginButton = $("#login")
  if (loginButton.length) {
    $("#registerModal").modal("show")
    $("#registerText").html("")
    $("#registerText").append(
      `
          <ul>
            <li>Create and share lists of the places you love, would love to go... or just want to keep on a list.</li>
          </ul>
          `
    )
  } else {
    closeNavButtons()
    closeSidebar()
    createNewList()
  }
});

//toggle navigation buttons
const toggleNavButtons = function() {
  let sideNav = $("#sideNav")
  console.log(sideNav)
  if (!sideNav.hasClass("pushedbtn")) {
    sideNav.addClass("pushedbtn")
  } else if (sideNav.hasClass("pushedbtn")) {
    sideNav.removeClass("pushedbtn")
  };
}

//toggle sidebar buttons
const toggleSideBar = function() {
  let sideBar = $("#vygr-sidebar")
  if (sideBar.hasClass("closed-sidebar")) {
    sideBar.removeClass("closed-sidebar")
    sideBar.addClass("open-sidebar")

  } else {
    sideBar.removeClass("open-sidebar")
    sideBar.addClass("closed-sidebar")
  };
}

const closeNavButtons = function() {
  let sideNav = $("#sideNav");
  if (sideNav.hasClass("pushedbtn")) {
    sideNav.removeClass("pushedbtn")
  };
}

//toggle sidebar buttons
const closeSidebar = function() {
  let sideBar = $("#vygr-sidebar")
  if (sideBar.hasClass("open-sidebar")) {
    sideBar.removeClass("open-sidebar")
    sideBar.addClass("closed-sidebar")

  };
}

var clickedListId = undefined;
var clickedList = undefined;

//userlists functionality
//displays lists in sidebar
const showUserLists = function(map) {
  let sideBar = $("#vygr-sidebar")
  if (sideBar.hasClass("closed-sidebar")) {
    sideBar.removeClass("closed-sidebar")
    sideBar.addClass("open-sidebar")
  };

  let likedList =  
  `
  <div class="sidebar-container">
    <div class="list-details">
      <li class="userlist likedplaceslist" id="liked-venues" data-name="liked-venues"><i class="bi bi-heart-fill"></i>
        Liked Places
      </li>        
    </div>
  </div>
    `

  $("#userLists").html("");
  $(".venue-info-card").html("");
  toggleNavButtons()

  $.ajax({
    type: 'GET',
    url: '/api/userlist/',
    data: {},
    success: function(data) {
      console.log(data)
      if (data.length == 0){
        console.log("empty list")
        $.ajax({
          type: 'GET',
          url: '/api/currentuserinfo/',
          data: {},
          success: function(data) {
            console.log(data)
            $("#userLists").append(
              ` 
              <div class="bookmark-header">
                <h5 class="bookmark-title">${data[0].username}'s Lists</h5>
              </div>
              `
            )

            $("#userLists").append(likedList)
          }
        })
      } else {
      $("#userLists").append(
        ` 
        <div class="bookmark-header">
          <h5 class="bookmark-title">${data[0].user.username}'s Lists</h5>
        </div>
        `)
        
      $("#userLists").append(likedList)
        }
      for (i = 0; i < data.length; i++) {
        var listName = data[i].list_name;
        var listId = data[i].id;
        // var venueList = [];
        // venueList.push(item.venue.id)
        console.log(`Loaded ${listName}:${listId}`)
        $("#userLists").append(
          `
          <div class="sidebar-container">
            <div class="list-details">
              <li class="userlist sidebarlist" id="list-${listId}" data-name="${listName}" data-pk="${listId}">
                ${listName}
              </li>
            </div>
            <div class="list-options">
              <span class="card-info">
              <i id="list-${listId}-edit" class="card-icon bi bi-pencil-square default-like" data-name="${listName}" data-pk="${listId}"></i>
              <i id="list-${listId}-delete" class="card-icon bi bi-x-circle-fill default-bookmark" data-name="${listName}" data-pk="${listId}"></i>
              <i id="list-${listId}-share" class="card-icon bi bi-share-fill default-bookmark default-bookmark" data-name="${listName}" data-pk="${listId}"></i> 
            </div>
          </div>
          `)
        // edits list
        document.getElementById("list-" + listId + "-edit").addEventListener('click', function(e) {
          console.log("Clicked edit")
          e.stopPropagation()
          console.log(e.target)
          clickedList = e.target.getAttribute('data-name')
          clickedListId = e.target.getAttribute('data-pk')

          editList()
        });
        // deletes list
        document.getElementById("list-" + listId + "-delete").addEventListener('click', function(e) {
          console.log("Clicked delete")
          clickedList = e.target.getAttribute('data-name')
          clickedListId = e.target.getAttribute('data-pk')
          deleteList(clickedListId, clickedList)
        });

        document.getElementById("list-" + listId + "-share").addEventListener('click', function(e) {
          console.log("Clicked share")
          fetch(`/electra/list/build_list_link/${$(e.target).data("pk")}/`).then(resp => resp.json()).then(json => {

            let domain = document.location.origin
            let link = domain + json.link
            console.log(link)
            if (navigator.share) {
              navigator.share({
                  title: 'VYGR: Share Your World',
                  text: 'Check out this list!',
                  url: link,
                }).then(() => {
                  console.log('Thanks for sharing!');
                })
                .catch(console.error);
            } else {
              // deskop
            }
          })

        });
      }
    }
  });
};

$('#createListModal').on('hide.bs.modal', function() {
  var listName = $("#newListName")
  listName.empty()
})

//create new list
const createNewList = function() {
  console.log("creating a new list")
  if ($("#userlist-modal").hasClass('show')) {
    console.log("List modal blocking")
    $("#userlist-modal").modal('hide')
  }
  $("#newlistmodal").modal('show');
  var listName = $("#newListName")
  listName.val("")
}

$("#createListModal").click(function() {
  createNewList()
});

$("#save-list").click(function() {
  var listName = $("#newListName").val();
  console.log(listName)
  $.ajax({
    type: 'POST',
    url: '/electra/create_new_list/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'list_name': listName
    },
    success: function(data) {
      console.log(data)
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
      closeNavButtons()
      closeSidebar()
    }
  });
});

//edit list
const editList = function() {
  if (clickedListId !== undefined) {
    $("#editListName").val("")
    $("#editListModal").modal('show');
    $("#editListLabel").text(`Edit ${clickedList}`)
  }
}
$("#save-edited-list").click(function() {
  let listName = document.getElementById("editListName").value;
  saveEditedList(listName)
});

const saveEditedList = function(listName) {
  console.log(clickedListId, listName)
  if (clickedListId !== undefined) {
    closeNavButtons()
    closeSidebar()
    $.ajax({
      type: 'POST',
      url: '/electra/update_list_name/',
      data: {
        csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        'id': clickedListId,
        'list_name': listName
      },
      success: function(data) {
        $("#newlistmodal").modal('hide');
        $("#userLists").html("");
      }
    });
  }
}

//deletelist
const deleteList = function(clickedListId, clickedList) {
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
      closeNavButtons()
      closeSidebar()
      showDeleteSuccessSnackBar();
    }
  });
}

//shows clicked list's venues on map
$("#userLists").on('click', "li", function(e) {
  if ($(e.target).hasClass("sidebarlist")) {
    var listName = e.target.getAttribute('data-name');
    var listId = e.target.getAttribute('data-pk');
    console.log(`Clicked ${listName}:${listId}`);
    getClickedListVenues(listId, listName)
    toggleNavButtons()
    toggleSideBar()
    e.preventDefault();
  } else if ($(e.target).hasClass("likedplaceslist")) {
    var listName = e.target.getAttribute('data-name');
    console.log(`Clicked ${listName}:${listId}`);
    getLikedVenues()
    toggleNavButtons()
    toggleSideBar()
    e.preventDefault();
  } else if ($(e.target).hasClass("sidebarvenue")) {
    var venueId = e.target.getAttribute('data-pk');
    console.log(`clicked a veenue with id ${venueId}`)
    putSingleVenueOnMap(venueId)
  }


});

const getClickedListVenues = function(listId, listName) {
  console.log(`Getting Data from ${listId, listName}`);
  $.ajax({
    type: 'GET',
    url: '/api/savedvenues/',
    data: {
      'list_id': listId
    },
    success: function(data) {
      showVenuesInSidebar(data, listId, listName)
      addClickedListMarkersToMap(data, map, listId)
    }
  });
};

$("#search-box").click(function() {
  closeNavButtons()
  closeSidebar()
})


//search address feature
//searches address
function addressLookup(geocoder, resultsMap) {
  let bounds = resultsMap.getBounds();
  let address = document.getElementById("search-box").value; //gets user entry in address box
  geocoder.geocode({
    bounds: bounds,
    address: address
  }, (results, status) => {
    if (status === "OK") {
      resultsMap.setCenter(results[0].geometry.location);
      resultsMap.setZoom(12)
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
      addSearchedMarkersToMap(data, map)
    }
  });
};

$("#search-box").keyup(function(map) {
  if ($("#search-type-icon").hasClass("bi bi-shop")) {
    const searchTerm = document.getElementById("search-box").value;

    // Don't want to search if only a few characters
    if (searchTerm.length < 2) {
      if (searchTerm.length === 0) {
        // Deleted search term so remove everything
        $("#search-results").empty()
      }
      return // don't need to do anything else
    }
    search()
  }
});


const search = function() {
  $("#userLists").html("");
  $(".venue-info-card").html("");
  $("#search-results").empty()
  let searchTerm = document.getElementById("search-box").value;
  $.ajax({
    type: 'GET',
    url: '/electra/search/',
    data: {
      'search_term': searchTerm
    },
    success: function(data) {
      $("#search-results").html('')
      data.forEach(([cafeId, cafeName, cafeAddress]) => {
        var cafeId = cafeId;
        var cafeName = cafeName;
        var cafeAddress = cafeAddress;
        var searchList = $(
          `<div class="search-result-box" >
                <li class="search-list-item ml-2" id="${cafeName}" data-idtext="${cafeId}" data-nametext="${cafeName}">
                ${cafeName}
                <span class="text-muted ml-2" data-address="${cafeAddress}">${cafeAddress}</span>
                </li>
            </div>`
        );
        searchList.appendTo('#search-results');

      });
    }
  });
};



$("#search-results").click(function(e) {
  console.log(e.target);

  let venueId = $(e.target).data("idtext");
  let selectedVenue = $(e.target).data("nametext");
  $("#search-results").empty()
  console.log(venueId);
  console.log(selectedVenue);
  $("#search-box").val(selectedVenue)
  // selectedPlaces.add(selectedVenue);
  putSingleVenueOnMap(venueId)

});

//fix
const putSingleVenueOnMap = function(venueId) {
  $.ajax({
    type: 'GET',
    url: 'electra/place_search/',
    data: {
      'pk': venueId
    },
    success: function(data) {
      console.log(data)
      addSearchedMarkersToMap(data, map)
      let lat = data[0][2]
      let lng = data[0][3]
      let position = {
        lat,
        lng
      }
      map.setCenter(position);
      map.setZoom(15)
    }
  });
}

const clearMarkers = function(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  };
};

$.ajax({
  type: 'GET',
  url: '/api/liked/',
  data: {},
  success: function(data) {
    for (i = 0; i < data.length; i++) {
      let likedCafe = data[i].liked_venue.cafe_name;
      likedVenues.add(likedCafe)
    }
  }
});

const addSearchedMarkersToMap = function(data, map) {
  searchedCafeIdArray = []
  $("#indexCardList").empty()
  for (i = 0; i < data.length; i++) { //puts markers in the markers set
    searchedCafeIdArray.push(data[i][6]);
  };
  gatherSearchedMarkerData(searchedCafeIdArray, map)
};

const gatherSearchedMarkerData = function(listOfCafes, map, listId) {
  for (i = 0; i < listOfCafes.length; i++) {
    cafeId = listOfCafes[i];
    console.log[cafeId]
    $.ajax({
      type: 'GET',
      url: '/electra/get_user_markers/',
      data: {
        'pk': cafeId,
      },
      success: function(data) {
        putSearchedMarkersOnMap(data, map, listId)
      }
    });
  }
};

const putSearchedMarkersOnMap = function(data, map) {

  console.log(data)

  for (let i = 0; i < data.length; i++) {
    let cafeId = data[i][7]
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(data[i][2], data[i][3]),
      map: map,
      animation: google.maps.Animation.DROP,
      icon: markerStyles[0],
      title: data[i][0],
      cafeId: data[i][7]
    });

    markers.push(marker)

    marker.addListener("click", () => {
      removeRedMarker()
      marker.setIcon(markerStyles[1]);
      console.log(marker.title)
      venueName = (marker.title)
      cafeId = (marker.cafeId)
      showVenueCard(cafeId, venueName)
      console.log(cafeId, venueName)

      map.panTo(marker.getPosition())
      map.setZoom(15);
    });

    var infowindow = new google.maps.InfoWindow({
      content: `
        <div id="${cafeId}" class="infowindow" data-text="${data[i][0]}">
        ${data[i][0]}
        </div>
        `
    });

    infowindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });
  };
};

$(`div`).on('click', '.infowindow', function(e) {
  console.log("clicked")
  console.log(markers)
  venueName = $(e.target).attr('data-text')
  cafeId = (e.target.id)
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].cafeId == cafeId) {
      let matchedMarker = markers[i]
      let cafeId = markers[i].cafeId
      console.log(`Found match: ${cafeId} - ${venueName}`)
      activateMarker(cafeId, venueName, matchedMarker)
    }
  }
  e.stopPropagation()
})


const activateMarker = function(cafeId, venueName, activatedMarker) {
  removeRedMarker()
  activatedMarker.setIcon(markerStyles[1]);
  showVenueCard(cafeId, venueName)
  map.panTo(activatedMarker.getPosition())
  map.setZoom(15);
}

const removeRedMarker = function() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setIcon(markerStyles[0])
  };
};

const showVenueCard = function(cafeId, venueName) {
  $("#venueCard").empty()

  const assignHeartIfVenueLiked = function(venueName) {
    $.ajax({
      type: 'GET',
      url: '/api/liked/',
      data: {},
      success: function(data) {
        for (i = 0; i < data.length; i++) {
          let likedCafe = data[i].liked_venue.cafe_name;
          if (likedCafe == venueName) {
            console.log("Match found" + venueName)
            let venueHeart = document.getElementById(venueName + "-like")
            console.log(venueHeart)
            venueHeart.classList.add("liked-venue")
          }
        }
      }
    });
  }

  $.ajax({
    type: 'GET',
    url: '/electra/info_box/',
    data: {
      'pk': cafeId
    },
    success: function(data) {
      console.log(data)
      let venueId = data[0][0]
      let venueName = data[0][1]
      let venueAddress = data[0][2]

      assignHeartIfVenueLiked(venueName)

      let myCol = $('<div id="col"></div>');
      let venueCard = $(
        `<div id="${venueName}-venue-card" class="card venue-card" data-idtext="${venueName}">
        <div class="card-body" id="${venueName}-cardbody" data-idtext="${venueName}">
        <div class="card-top" id="${venueName}-card-top" data-idtext="${venueName}">
        <div class="card-close-div">
          <i id="card-close-icon" class="card-close bi bi-x"></i>
        </div>
        <h5 class="card-title" id="${venueName}-card" data-idtext="${venueName}">${venueName}</h5>
          <h6 class="card-subtitle venue-address mb-2 text-muted">${venueAddress}</h6>
          <span class="card-info">
            <i id="${venueName}-like" class="card-icon bi bi-heart-fill default-like" data-idtext="${venueId}"></i>
            <i id="${venueName}-bookmark" class="card-icon bi bi-bookmark-plus-fill default-bookmark" data-idtext="${venueId}"></i>
            <i id="${venueName}-share" class="card-icon bi bi-share-fill default-bookmark default-bookmark" data-idtext="${venueId}"></i> 
         </div>
         <div class="card-image">
         <img id="venue-image" src="">
         </div>
         <div class="mt-1 form-group comment-box">
            <textarea class="form-control" id="comment-textbox" rows="4" placeholder="Add what you like/recommend/think about this place..."></textarea>
            <div class="comment-submit">
              <button id="comment-submit-btn" class="commentSubmitBtn">Comment</button>
          </div>
        </div>
         <div class="card-text">
          <div id="venueComments" class="comment-body"></div>
        </div>
        </div>
      </div>
      `
      );


      venueCard.appendTo(myCol);
      myCol.appendTo('#venueCard');
      let connectedComments = []
      //get comments
      $.ajax({
        type: 'GET',
        url: '/api/venuecomments/',
        data: {},
        success: function(data) {
          console.log(data)
          for (i = 0; i < data.length; i++) {
            if (venueId == data[i].venue.id) {
              connectedComments.push(data[i])
            }
          };
          let user = undefined
          for (i = 0; i < connectedComments.length; i++) {

            user = connectedComments[i].user.id;
            let userName = connectedComments[i].user.username;
            let comment = connectedComments[i].comment;
            $("#venueComments").append(`
              <div class="card-text">
              <div class="venue-paragraph user-comment">
                <span class="user-details">
                  <img src="/static/testingland/img/rd.jpeg" alt="Avatar" class="avatar">
                  <div class="dropdown">
                    <a class="venue-source dropdown-toggle card-subtitle" href="#" role="button" id="${user}-dropdown" data-idtext="${user}-adder" data-bs-toggle="dropdown">-${userName}</a>
                    <ul id="${user}-dropdown-menu" class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li><a class="dropdown-item viewVenues" id="viewVenues-${user}" data-idtext="viewVenues-${user}" href="#">View Added Venues</a></li>
                      <li><a class="dropdown-item viewLists" id="viewLists ${user}" data-idtext="viewLists-${user}">View Lists</a></li>
                      <li><a class="dropdown-item viewLiked" id="viewLiked ${user}" data-idtext="viewLiked-${user}">View Liked Venues</a></li>
                      <li>
                        <hr class="dropdown-divider">
                      </li>
                      <li><a class="dropdown-item text-danger" id="report ${user}" data-idtext="report-${user}">Report User</a></li>
                    </ul>
                  </div>
                </span>
                <div id="venueComments" class="comment-body">
                  <div class="venue-text">${comment}</div>
                </div>
              </div>
            </div>

              `)
          };
           //view the user's lists, added venues and liked venues

          $(`#${user}-dropdown`).click(function(e) {
            // if ($(".venue-info-card").has("height")) {
            //   console.log("has height")
            //   $(".venue-info-card").removeClass("height")
            //   $(".card-close").addClass("hide")
            // };
    
            // let sideBar = $("#vygr-sidebar")
            // let openBtn = $(".openbtn")
            // if (sideBar.hasClass("open-sidebar")) {
            //   sideBar.removeClass("open-sidebar")
            //   sideBar.addClass("closed-sidebar")
            //   openBtn.removeClass("pushedbtn")
            // };
    
            // $(".venue-info-card").html("")
    
            if (e.target && e.target.matches(`a.viewVenues`)) {
              console.log(e.target.id)
              // viewAllVenues(source)
              e.stopPropagation()
    
            } else if (e.target && e.target.matches(`a.viewLists`)) {
              console.log(e.target.id)
              // viewLists(source)
            } else if (e.target && e.target.matches(`a.viewLiked`)) {
    
              console.log(e.target.id)
              // viewAllLiked(source)
            }
            
          });
        }    
      });

      //post comments

      $("#comment-submit-btn").click(function() {
        let commentText = $("#comment-textbox").val()
        console.log(commentText)
        console.log(`Sending comments for venue ${venueId}`)
        $.ajax({
          type: 'POST',
          url: '/add_comment/',
          data: {
            csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            'venue_id': venueId,
            'comment': commentText
          },
          success: function(data) {
            console.log(data)
          }
        });
      })
      
      let venueInfo = $('#venueCard')

      //view all venues added by clicked user
      const viewAllVenues = function(source) {
        clearMarkers()
        let userName = user
        console.log(userName)
        $.ajax({
          type: 'GET',
          url: '/electra/get_user_venues/',
          data: {
          },
          success: function(data) {
            console.log(data)
            addSearchedMarkersToMap(data, map)
          }
        })
      }

      const viewAllLiked = function(source) {
        clearMarkers()
        let userName = source
        $.ajax({
          type: 'GET',
          url: '/electra/get_user_liked/',
          data: {
            'userName': userName
          },
          success: function(data) {
            console.log(data)
            addSearchedMarkersToMap(data, map)
          }
        });
      };

      //view the clicked on User's lists
      const viewLists = function(source) {
        $("#userLists").html("");
        $.ajax({
          type: 'GET',
          url: '/electra/otheruserlist/',
          data: {
            'userName': source
          },
          success: function(data) {
            console.log(data)
            toggleSideBar()
            data.forEach(item => {
              console.log(item)
              var listName = item[1];
              var listId = item[0];
              console.log(`Loaded ${listName}:${listId}`)
              $("#userLists").append(
                ` 
                  <h5 class="bookmark-header">${data[0].user.username}'s Lists</h5>
                  `
              )
              $("#userLists").append(
                `
              <li class="userlist sidebarlist" id="liked-venues" data-name="liked-venues">
                Liked Places
              </li>
              `
              )
              $("#userLists").append(
                `<li class="userlist sidebarlist" id="${listName}" data-name="${listName}" data-pk="${listId}">
                ${listName}
              </li>
              <span class="card-info">
              <i id="${listName}-share" class="card-icon bi bi-share-fill default-bookmark default-bookmark" data-name="${listName}" data-pk="${listId}"></i> 
              `
              )
              $(`#${listName}-share`).click(function(e) {
                console.log("Clicked share")
                fetch(`/electra/list/build_list_link/${$(e.target).data("pk")}/`).then(resp => resp.json()).then(json => {
                  let domain = document.location.origin
                  let link = domain + json.link
                  console.log(link)
                  if (navigator.share) {
                    navigator.share({
                        title: 'VYGR: Share Your World',
                        text: 'Check out this list!',
                        url: link,
                      }).then(() => {
                        console.log('Thanks for sharing!');
                      })
                      .catch(console.error);
                  }
                })
              });
            })
          }
        });

        $("#userLists").on('click', "li", function(e) {
          console.log(`Clicked ${listName}:${listId}`);

          if ($(e.target).hasClass("sidebarlist")) {
            var listName = e.target.getAttribute('data-name');
            var listId = e.target.getAttribute('data-pk');
            console.log(`Clicked ${listName}:${listId}`);
            getClickedListVenues(listId)
            toggleNavButtons()
            toggleSideBar()
            e.preventDefault();
          } else if ($(e.target).hasClass("likedplaceslist")) {
            var listName = e.target.getAttribute('data-name');
            console.log(`Clicked ${listName}:${listId}`);
            getLikedVenues()
            toggleNavButtons()
            toggleSideBar()
            e.preventDefault();
          } else if ($(e.target).hasClass("sidebarvenue")) {
            var venueId = e.target.getAttribute('data-pk');
            console.log(`clicked a veenue with id ${venueId}`)
            putSingleVenueOnMap(venueId)
          }
        });
      };

      //show venue info card mobile
      if ($(window).width() < 1024) {
        console.log('Less than 1024px');
        venueInfo.removeClass(`venue-info-card-closed`)
        $(".card-close").addClass("hide")
        $(".card-body").click(function() {
          if ($(".venue-info-card").has("venue-info-card-closed")) {
            $(".venue-info-card").remove("venue-info-card-closed")
            $(".venue-info-card").addClass("height")
            $(".card-close").removeClass("hide")
            console.log(`Expanding`)
          }
        })
        $("#card-close-icon").click(function(e) {
          if (e.target && e.target.matches(`i.card-close`)) {
            console.log(e.target.id)
            $(".venue-info-card").removeClass("height")
            $(".card-close").addClass("hide")
            e.stopPropagation()
          }
        })
        //show venue info card desktop
      } else if ($(window).width() >= 1024) {
        venueInfo.removeClass(`venue-info-card-closed`)
        $("#card-close-icon").click(function() {
          $(".venue-info-card").addClass("venue-info-card-closed")
          console.log(`Expanding`)
        })
      };

      const addVenueToLiked = function(placeToAdd) {
        console.log(placeToAdd);
        $.ajax({
          type: "POST",
          url: '/electra/liked/',
          data: {
            csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            'liked_venue': placeToAdd
          },
          success: function(data) {
            let liked = document.querySelectorAll(`[data-idtext="${placeToAdd}"]`);
            console.log(liked)
            liked[0].classList.add("liked-venue")
            showSnackBar()
          },
        });
      };

      //this function removes venue from liked list
      const removeVenueFromliked = function(venue, likedPlace) {
        console.log("Removing " + likedPlace)
        console.log(likedPlace)
        console.log(venue)
        $.ajax({
          type: 'GET',
          url: '/electra/remove_venue_from_liked',
          data: {
            'venue': likedPlace
          },
          success: function(data) {
            console.log("removed")
            venue.classList.remove("liked-venue")
            venue.classList.remove("default-like")
            showRemovedSuccessSnackBar();
          }
        });
      }

      document.getElementById(venueName + "-bookmark").addEventListener('click', function(e) {
        let venueToAdd = e.target.getAttribute('data-idtext')
        let loginButton = $("#login")
        if (loginButton.length) {
          alert("Login or Signup to bookmark venues to lists")
        } else {
          console.log("Bookmarking " + venueToAdd)
          addToListModal(venueToAdd)
        }
      });



      document.getElementById(venueName + "-like").addEventListener('click', function(e) {
        let likedPlace = e.target.getAttribute('data-idtext')
        let venue = document.getElementById(venueName + "-like")
        console.log(venue)
        let loginButton = $("#login")
        if (loginButton.length) {
          alert("Login or Signup to like venues")
        } else {
          if (venue.classList.contains("liked-venue")) {

            // venue.add("card-icon")
            removeVenueFromliked(venue, likedPlace)
          } else {
            console.log("Liking " + likedPlace)
            addVenueToLiked(likedPlace)
          }
        }
      })


      const shareVenue = document.getElementById(venueName + "-share");
      // Must be triggered some kind of "user activation"
      shareVenue.addEventListener('click', function(e) {
        fetch(`/electra/build_link/${$(e.target).data("idtext")}/`).then(resp => resp.json()).then(json => {

          let domain = document.location.origin
          let link = domain + json.link
          console.log(link)
          if (navigator.share) {
            navigator.share({
                title: 'VYGR: Share Your World',
                text: 'Check out this great place!',
                url: link,
              }).then(() => {
                console.log('Thanks for sharing!');
              })
              .catch(console.error);
          } else {

            // deskop
          }
        })
      });

      var request = {
        query: venueName,
        fields: ['place_id'],
      };

      let testNode = $("#hidden").get(0)

      var service = new google.maps.places.PlacesService(testNode);
      service.findPlaceFromQuery(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            let placeId = results[i].place_id
            getPlaceDetails(placeId)
          }
        }
      })

      const getPlaceDetails = function(placeId) {
        let testNode = $("#hidden").get(0)
        let request = {
          placeId: placeId,
          fields: [
            'rating',
            'opening_hours',
            'website',
            'price_level',
            'review',
            'photos'
          ]
        };

        service = new google.maps.places.PlacesService(testNode);
        service.getDetails(request, callback);

        function callback(results, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            // $("#website").attr("src", results.website)
            // $("#website").html(results.website)
            photos = results.photos
            photo = photos[0].getUrl({
              maxWidth: 500,
              maxHeight: 500
            })
            $("#venue-image").attr("src", photo)
          }
        }
      }
    }
  });
}



if ($("#bookmarked_id").length) {
  console.log(marker.title)
  venueName = (marker.title)
  cafeId = (marker.cafeId)
  showVenueCard(cafeId, venueName)
  map.panTo(marker.getPosition())
  map.setZoom(15);
};


//adding/removing venue from a list
const addToListModal = function(venueToAdd) {
  var userName = document.getElementById("username").innerText;
  console.log(userName);
  console.log("venue ID is " + venueToAdd);
  $("#userListsModal").empty();
  $('#userlist-modal').modal('show');
  // gets the user's lists and adds them to modal
  $.ajax({
    type: 'GET',
    url: '/electra/getuserlists/',
    data: {

    },
    success: function(data) {
      console.log(data)
      for (let i = 0; i < data.length; i++) {
        var listId = data[i][0]
        var listName = data[i][1]
        
        $("#userListsModal").append(
          `
          <div class="sidebar-container">
            <div id="details-${listId}" class="list-details">
              <li class="userlistModal grey-text" id="list-${listId}" data-name="${listName}" data-pk="${listId}">
                  ${listName}
              </li>
              <li id="${listId}-list-status" class="grey-text">
                
              </li>
            </div>
          </div>
          `)
          $(`#${listId}-list-status`).text("Not On List.")
          
        if ($(".userListModal").hasClass("black-text")) {
          $(".userListModal").removeClass("black-text")
        }
        checkForMatchingVenues(listId, listName, venueToAdd)
      }
    }
  });

  const checkForMatchingVenues = function(listId, listName, venueToAdd) {
    var venuesInList = []
    console.log(`Getting Data from ${listName}:${listId} comparing against ${venueToAdd}`);
    $.ajax({
      type: 'GET',
      url: '/api/savedvenues/',
      data: {
        'list_id': listId
      },
      success: function(data) {
        for (let i = 0; i < data.length; i++) {
          venuesInList.push(data[i].venue.id)
        }
        if (venuesInList.length == 0) {
          console.log(`${listId} is an empty list.`)
        } else {
          console.log(`Venues inside ${listId} are ${venuesInList} the venue to add's ID is ${venueToAdd}`)
          for (let i = 0; i < venuesInList.length; i++) {
            if (venueToAdd == venuesInList[i]) {
              console.log(`${venueToAdd} matches ${venuesInList[i]} found in ${listName}:${listId} - (${venuesInList[i]}) adding validation`)
              $(`#list-${listId}`).removeClass("grey-text")
              $(`#list-${listId}`).addClass("black-text")
              $(`#${listId}-list-status`).text("On List.")
              
            } else {
              console.log(`${venueToAdd} does not match ${venuesInList[i]} in ${listName}:${listId}`)
              
            }
          }
        }
      }
    });

    //add/remove venue
    $(`#list-${listId}`).click(function(e) {
      console.log("clicked")
      var listId = e.target.getAttribute('data-pk');
      var listname = e.target.getAttribute('data-name');
      let selectedList = `list-${listId}`;
      console.log(`The selected list is ${selectedList}`)
      console.log(`The selected venue is ${venueToAdd}`)
      if ($(e.target).hasClass("grey-text")) {
        console.log(`Adding ${venueToAdd} to ${listname}:${listId}`);
        addVenueToList(listId, venueToAdd);
        e.preventDefault();
        e.stopPropagation();
      } else if ($(e.target).hasClass("black-text")) {
        console.log(`Removing ${venueToAdd} from ${listname}:${listId}`);
        removeVenueFromList(venueToAdd, listId)
      };
    });
  };
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

const addVenueToList = function(listId, venueToAdd) {
  $.ajax({
    type: "POST",
    url: '/api/userlistvenue/',
    dataType: 'json',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'user_list': listId,
      'venue': venueToAdd
    },
    success: function(data) {
      // $("#userlist-modal").modal('hide');
      $(`#list-${listId}`).removeClass("grey-text")
      $(`#list-${listId}`).addClass("black-text")
      $(`#${listId}-list-status`).empty()
      $(`#${listId}-list-status`).text("On List.")

      showSnackBar()
    
    }
  });
};

//removing venue from list
const removeVenueFromList = function(venueName, listId) {
  $.ajax({
    type: 'GET',
    url: '/electra/remove_venue_from_list',
    data: {
      'user_list': listId,
      'venue': venueName
    },
    success: function(data) {
      console.log("removed")
      // $("#userlist-modal").modal('hide');
      $(`#list-${listId}`).removeClass("black-text")
      $(`#list-${listId}`).addClass("grey-text")
      $(`#${listId}-list-status`).empty()
      $(`#${listId}-list-status`).text("Not On List.")      
      showRemovedSuccessSnackBar();
    }
  });
}

//liked venues
$("#liked-venues").click(function() {
  console.log("ClickedLike")
  let loginButton = $("#login")
  if (loginButton.length) {
    alert("Login or Signup to view venues you've liked")
  } else {
    let sideBar = $("#vygr-sidebar")
    let sideNav = $("#sideNav")
    if (sideBar.hasClass("open-sidebar")) {
      sideBar.removeClass("open-sidebar")
      sideBar.addClass("closed-sidebar")
      sideNav.removeClass("pushedbtn")
      // mapCards.removeClass("pushedcards")
    };
    getLikedVenues()
  }
})

const getLikedVenues = function() {
  $.ajax({
    type: 'GET',
    url: '/api/liked/',
    data: {},
    success: function(data) {
      console.log(data)
      showLikedVenuesInSidebar(data)
      addLikedVenuesToMap(data, map)
    }
  });
};

const addLikedVenuesToMap = function(data, map) {
  console.log(data)
  likedVenuesList = []
  clearMarkers()
  $("#venueCard").empty()
  for (i = 0; i < data.length; i++) { //puts markers in the markers set
    likedVenuesList.push(data[i].liked_venue.id);
  };
  console.log(likedVenuesList)
  gatherListMarkerData(likedVenuesList, map)
};

const showVenuesInSidebar = function(data, listId, listName) {
  toggleSideBar()
  toggleNavButtons()
  $("#userLists").html("");
  $("#userLists").append(
    `
    <div class="bookmark-header">
    <li class="userlist back" id="back-to-lists" style="font-size: 1rem"><i class="bi bi-caret-left-fill"></i>
      Back to Lists</li>
    </div>
    `)
  console.log(data)
  console.log(listId)
  console.log(listName)
  if (data.length == 0) {
    console.log("Empty List")
    $.ajax({
      type: 'GET',
      url: '/api/currentuserinfo/',
      data: {},
      success: function(data) {
        console.log(data)
        $("#userLists").append(
          `
          <div class="bookmark-header">
            <h5 class="bookmark-title" id="list-name">${listName}</h5>
            <h6 class="list-creator">Created by ${data[0].username}</h6>
          </div>
          `
        )
      }
    })
  } else {
    $("#userLists").append(
      `
      <div class="bookmark-header">
        <h5 class="bookmark-title" id="list-name">${data[0].user_list.list_name}</h5>
        <h6 class="list-creator">Created by ${data[0].user.username}</h6>
      </div>
      `
    )
    for (i = 0; i < data.length; i++) {
      console.log(data[i])
      $(".venue-info-card").html("");
      $("#userLists").append(
        `
        <div class="sidebar-container">
          <div class="list-details">
            <li class="userlist sidebarvenue" id="list-venue-${data[i].venue.id}" data-name="${data[i].venue.cafe_name}" data-pk="${data[i].venue.id}">
              ${data[i].venue.cafe_name}
            </li>
          </div>
          <div class="list-options">
          <span id="venue-options" class="card-info">
            <i id="list-bookmark" class="card-icon bi bi-bookmark-plus-fill default-bookmark" data-name="${data[i].venue.cafe_name}" data-pk="${data[i].venue.id}"></i>
            <i id="${data[i].venue.cafe_name}-list-share" class="card-icon bi bi-share-fill default-bookmark default-bookmark" data-name="${data[i].venue.cafe_name}" data-pk="${data[i].venue.id}"></i> 
            <i id="venue-${data[i].venue.cafe_name}-list-delete" class="card-icon bi bi-x-circle-fill default-bookmark" data-name="${data[i].venue.cafe_name}" data-pk="${data[i].venue.id}"></i>
          </div>
        </div>
        `
      )
    }
  }
  $(".back").click(function() {
    console.log("CLICKED")
    closeNavButtons()
    closeSidebar()
    showUserLists()
  })

  $("#venue-options").on('click', "i", function(e) {
    if ($(e.target).hasClass("default-bookmark")) {
      let venueToAdd = e.target.getAttribute('data-pk')
      let loginButton = $("#login")
      if (loginButton.length) {
        alert("Login or Signup to bookmark venues to lists")
      } else {
        console.log("Bookmarking " + venueToAdd)
        addToListModal(venueToAdd)
      }
    }
  })
};

const showLikedVenuesInSidebar = function(data) {
  toggleSideBar()
  toggleNavButtons()
  $("#userLists").html("");
  console.log(data)
  $("#userLists").append(
    `
    <div class="bookmark-header">
      <li class="userlist" id="back-to-lists" style="font-size: 1rem"><i class="bi bi-caret-left-fill"></i>
      Back to Lists</li>
    </div>

    <div class="bookmark-header">
      <h5 class="bookmark-title" id="list-name">Liked Venues</h5>
      <h6 class="list-creator">Created by ${data[0].user.username}</h6>
    </div>
    `
  )
  for (i = 0; i < data.length; i++) {
    console.log(data[i])
    $(".venue-info-card").html("");
    $("#userLists").append(
      `
      <div class="sidebar-container">
        <div class="list-details">
          <li class="userlist sidebarvenue" id="venue-${data[i].liked_venue.id}" data-name="${data[i].liked_venue.cafe_name}" data-pk="${data[i].liked_venue.id}">
            ${data[i].liked_venue.cafe_name}
          </li>
        </div>
        <div class="list-options">
        <span class="card-info">
          <i id="${data[i].liked_venue.cafe_name}-bookmark" class="card-icon bi bi-bookmark-plus-fill default-bookmark" data-name="${data[i].liked_venue.cafe_name}" data-pk="${data[i].liked_venue.id}"></i>
          <i id="${data[i].liked_venue.cafe_name}-share" class="card-icon bi bi-share-fill default-bookmark default-bookmark" data-name="${data[i].liked_venue.cafe_name}" data-pk="${data[i].liked_venue.id}"></i> 
          <i id="venue-${data[i].liked_venue.cafe_name}-delete" class="card-icon bi bi-x-circle-fill default-bookmark" data-name="${data[i].liked_venue.cafe_name}" data-pk="${data[i].liked_venue.id}"></i>
        </div>
      </div>
      `)
  }
  $("#back-to-lists").click(function() {
    closeNavButtons()
    closeSidebar()
    showUserLists()
  })
};

const addClickedListMarkersToMap = function(data, map, listId) {
  clickedListCafeNamesList = []
  clearMarkers()
  $("#venueCard").empty()
  for (i = 0; i < data.length; i++) { //puts markers in the markers set
    clickedListCafeNamesList.push(data[i].venue.id);
  };
  gatherListMarkerData(clickedListCafeNamesList, map, listId)
};



const gatherListMarkerData = function(listOfCafes, map, listId) {
  console.log(listOfCafes)
  for (i = 0; i < listOfCafes.length; i++) {
    pk = listOfCafes[i];
    console.log(pk)
    $.ajax({
      type: 'GET',
      url: '/electra/get_user_markers/',
      data: {
        'pk': pk,
      },
      success: function(data) {
        console.log(data)
        putMarkersOnMap(data, map, listId)
      }
    });
  }
};

const putMarkersOnMap = function(data, map, listId) {
  const svgMarker = {
    path: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    fillColor: "grey",
    fillOpacity: 1,
    strokeWeight: 1.2,
    rotation: 0,
    scale: 1.8,
    anchor: new google.maps.Point(15, 30),
  };

  const selectedSvgMarker = {
    path: "M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
    fillColor: "#e4324c",
    fillOpacity: 1,
    strokeWeight: 1.2,
    rotation: 0,
    scale: 1.8,
    anchor: new google.maps.Point(15, 30),
  };

  for (let i = 0; i < data.length; i++) {
    let cafeId = data[i][7]
    console.log(cafeId, data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(data[i][2], data[i][3]),
      map: map,
      animation: google.maps.Animation.DROP,
      // title: data[i][0],
      icon: svgMarker,
      cafeId: data[i][7]
    });

    console.log("Opening marker title")

    var infowindow = new google.maps.InfoWindow({
      content: `
        <div id="${cafeId}" class="infowindow" data-text="${data[i][0]}">
        ${data[i][0]}
        </div>
        `
    });

    infowindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
    });

    $(`#infowindow-${cafeId}`).click(function(e) {
      console.log(e.target.id)
    })

    markers.push(marker)


    marker.addListener("click", () => {
      marker.setIcon(selectedSvgMarker);
      console.log(marker.title)
      venueName = (marker.title)
      cafeId = (marker.cafeId)
      showVenueCard(cafeId, venueName)
      console.log(cafeId, venueName)

      map.panTo(marker.getPosition())
      map.setZoom(15);
    });
    markers.push(marker)
  };

  map.setCenter(new google.maps.LatLng(data[0][2], data[0][3]));
  map.setZoom(14)

  $("#username").click(function() {
    console.log("clicked profile")
    showProfileModal()
  });

  const showProfileModal = function() {
    $("#profile-modal").modal('show');
  };
};

// feedback modal
$("#feedback").click(function() {
  loginButton = $("#login")
  if (loginButton.length) {
    alert("Login or Signup to Provide Feedback")
  } else {
    closeNavButtons()
    closeSidebar()
    $("#feedback-modal").modal('show');
  }
})

$("#submit-feedback").click(function() {
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
      'feedback_type': typeOfFeedback,
      'feedback_content': description
    },
    success: function(data) {
      console.log("All good, sent")
    }
  });
};

//adding a place
$("#add-place").click(function() {
  let loginButton = $("#login")
  if (loginButton.length) {
    $("#registerModal").modal("show")
    $("#registerText").html("")

    $("#registerText").append(
      `
        <ul>
          <li>Add the places you love to the VYGR Map.</li>
          <li>Create lists of the best spots.</li>
              <li>Easily share places and lists.</li>
        </ul>
        `
    )
  } else {
    closeNavButtons()
    closeSidebar()
    $("#add-place-modal").modal('show');
  }
})
//sending the added place a place
$("#submit-suggestion").click(function() {
  let venueName = $("#suggestion-name").val();
  let venueType = $("#venue-type").val();
  let venueAddress = $("#suggestion-address").val();
  closeNavButtons()
  closeSidebar()
  sendSuggestion(venueName, venueType, venueAddress)
})

const sendSuggestion = function(venueName, venueType, venueAddress) {
  console.log(venueName + " " + venueType + " " + venueAddress)
  $.ajax({
    type: 'POST',
    url: '/electra/suggestion/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'venue_name': venueName,
      'venue_type': venueType,
      'venue_address': venueAddress
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
  setTimeout(function() {
    x.className = x.className.replace("show", "");
  }, 3000);
}

function showDeleteSuccessSnackBar() {
  // Get the snackbar DIV
  var x = document.getElementById("deleteSuccessSnackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function() {
    x.className = x.className.replace("show", "");
  }, 3000);
}

function showRemovedSuccessSnackBar() {
  // Get the snackbar DIV
  var x = document.getElementById("venueRemovedSuccessSnackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function() {
    x.className = x.className.replace("show", "");
  }, 3000);
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
// const csrftoken = getCookie('csrftoken');

const commitNewCafe = function(geocoder, marker, map) {
  let streetAddress = document.getElementById("street-address").value;

  let address = `${streetAddress}`
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
      let name = $("#venue-name-box").val()
      console.log(geolat)
      console.log(geolong)
      let type = $("#venue-type-box").val()
      let description = $("#description-box").val()

      $.ajax({
        type: 'GET',
        url: '/electra/all_venues/',
        data: {},
        success: function(data) {
          console.log(data)
          for (i = 0; i < data.length; i++) {
            let existingVenue = data[i][0]
            let existingVenueAddress = data[i][1]
            if (name == existingVenue) {
              console.log("potential match found, checking address")
              console.log("...")
              console.log(`added venue address is ${address}`)
              console.log("...")
              console.log(`existing venue address is ${existingVenueAddress}`)
              if (address == existingVenueAddress) {
                console.log(`addresses match`)
                $("#venueAddedModal").modal('show');
                $("#venueAddedText").text(`${name} has already been added.`)
                return
                // });
              } else {
                console.log("addresses do not match committing venue")
              }
            }
          }
          postVenue()
        }
      })

      const postVenue = function() {
        $.ajax({
          type: 'POST',
          url: '/add_cafe/',
          data: {
            csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            'venuename': name,
            'venueaddress': address,
            'latitude': geolat,
            'longitude': geolong,
            'venuetype': type,
          },
          success: function(data) {
            console.log(`Adding comment to ${data}`)
            venueId = data[0]
            venueName = data[1]
            $.ajax({
              type: 'POST',
              url: '/add_comment/',
              data: {
                csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
                'venue_id': venueId,
                'comment': description.replace(/\n/g, "<br>")
              },
              success: function() {}
            });

            console.log("Data sent");
            
            $("#add-place-modal").modal('hide');
            $("#venueAddedModal").modal('show');
            $("#venueAddedText").text(`${venueName} Added.`)
            $("#takeMeThere").click(function() {
              $("#add-place-modal").modal('hide');
              console.log("Clicked Take Me There")
              $("#venueAddedModal").modal('hide');
              putSingleVenueOnMap(venueId)
            });
            $("#closeVenueAddedModal").click(function() {
              location.reload();
              $("#venueAddedModal").modal('hide');
            })
          }
        });
      }
    };
  })
};

$('#add-place-modal').on('hidden.bs.modal', function () {
  $(this).find('form').trigger('reset');
})


//onbarding

// Initiate the tour


const tour = new Shepherd.Tour({
  defaultStepOptions: {
    classes: 'shadow-md bg-purple-dark',
    scrollTo: { behavior: 'smooth', block: 'center' }
  },
  useModalOverlay: true
    
});

tour.addStep({
  id: 'vygr-welcome',
  text: 'VYGR is about discovering new and familiar places through friends, family and people you trust.',
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.addStep({
  id: 'search-box-step',
  text: 'Easily search for addresses or places on the VYGR Map.',
  attachTo: {
    element: '#search-box',
    on: 'bottom'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});
tour.addStep({
  id: 'search-type-step',
  text: 'Switch between address and place search.',
  attachTo: {
    element: '#search-type',
    on: 'bottom'
  },
  classes: 'example-step-extra-class',
 
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.addStep({
  id: 'sidebar-buttons-step',
  text: 'These 4 buttons are your control panel.',
  attachTo: {
    element: '#sideNav',
    on: 'right'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.addStep({
  id: 'add-place-step',
  text: 'Add the places you love to the VYGR Map',
  attachTo: {
    element: '#add-place',
    on: 'right'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});
tour.addStep({
  id: 'create-list-step',
  text: 'Create new lists.',
  attachTo: {
    element: '#createList',
    on: 'right'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.addStep({
  id: 'area-search-step',
  text: 'Quickly search the VYGR Map for nearby places.',
  attachTo: {
    element: '#area-search',
    on: 'right'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});

tour.addStep({
  id: 'user-lists-step',
  text: 'View and manage all of your lists here.',
  attachTo: {
    element: '#user-lists',
    on: 'right'
  },
  classes: 'example-step-extra-class',
  buttons: [
    {
      text: 'Next',
      action: tour.next
    }
  ]
});


if(!localStorage.getItem('shepherd-tour')) {
  tour.start();
  localStorage.setItem('shepherd-tour', 'yes');
}


console.log("index3.js 0.01");
