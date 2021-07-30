var markers = new Set(); //empty array
var selectedPlaces = new Set()
var marker, i;
var service;


//homepage map
$(document).ready(function() {
  var currentVenue = "";
  //Google Maps API setup
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&libraries=places&callback=initMap&map_ids=33df39eac4360b95';
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
          disableDefaultUI: true,
          gestureHandling: 'greedy'
        });
        console.log("Map Done. User location is " + [userLat + userLong]);
        showUserLists()

        const hideUI = function(){
          console.log("Bounds Changed")
          $("#sideNav").css("left", "-7rem")
          $("#vygr-nav").css("top", "-20rem")
        }

        const showUI = function(){
          console.log("Idling")
          $("#sideNav").css("left", "0rem")
          $("#vygr-nav").css("top", "0rem")

        }

        map.addListener("center_changed", hideUI)
        map.addListener("idle", showUI)



        
      }
    }

    $(".close").click(function() {
      $(".modal").modal('hide')
    })

    $(".closer").click(function() {
      $(".modal").modal('hide')
    })
    //create geocoder
    const geocoder = new google.maps.Geocoder();

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
  

    const switchSearchType = function() {
      let searchType = $("#search-type-icon")
      let searchInput = $('#search-box')
      if (searchType.hasClass("bi bi-geo-alt-fill")) {
        searchType.removeClass("bi bi-geo-alt-fill")
        searchType.addClass("bi bi-shop")
        searchInput.attr('placeholder', 'Search Address...');

      } else if (searchType.hasClass("bi bi-shop")) {
        searchType.removeClass("bi bi-shop")
        searchType.addClass("bi bi-geo-alt-fill")
        searchInput.attr('placeholder', 'Search Place...');

      }
    };

    window.addEventListener('resize', () => {
      let vh = window.innerHeight * 0.01;
      document.getElementsByClassName('google-map').style.setProperty('--vh', `${vh}px`);
    })

  

    //search address or venue 
    document.getElementById("submit").addEventListener("click", () => {
      let searchType = $("#search-type-icon")
      if (searchType.hasClass("bi bi-geo-alt-fill")) {
        addressLookup(geocoder, map);
      } else if (searchType.hasClass("bi bi-shop")) {
        venueLookup()
      }
    });

    $("#user-lists").click(function() {
      toggleNav()
    })

    //search area
    document.getElementById("area-search").addEventListener("click", () => {
      getVenues(map)
      // toggleNav()
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
  const createNewList = function() {
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
        'list_name': listName
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
        'id': clickedListId,
        'list_name': listName
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
  const editList = function(clickedListId, clickedList) {
    $("#editListModal").modal('show');
    $("#editListLabel").text(`Edit ${clickedList}`)
    // $('#editListName').val(clickedList);
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
        showUserLists();
        showDeleteSuccessSnackBar();
      }
    });
  }

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
        addClickedListMarkersToMap(data, map, listId)
      }
    });
  };

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
    $("#search-results").empty()
    let searchTerm = document.getElementById("search-box").value;
    $.ajax({
      type: 'GET',
      url: '/electra/search/',
      data: {
        'search_term': searchTerm
      },
      success: function(data) {
        data.forEach(([cafeId, cafeName, cafeAddress]) => {
          var cafeId = cafeId;
          var cafeName = cafeName;
          var cafeAddress = cafeAddress;
            var searchList = $(
              `<div>
                <li class="search-list-item ml-2" data-idtext="${cafeName}" id="${cafeName}">
                ${cafeName}
                <span class="text-muted ml-2" data-idtext="${cafeName}">${cafeAddress}</span>
                </li>
            </div>`
            );
            searchList.appendTo('#search-results');
          
        });
      }
    });
  };

  $("#search-results").click(function(event) {
    var selectedVenue = $(event.target).data("idtext");
    $("#search-results").empty()
    console.log("Clicked" + " " + selectedVenue);
    $("#search-box").val(selectedVenue)
    // selectedPlaces.add(selectedVenue);

    $.ajax({
      type: 'GET',
      url: 'electra/place_search/',
      data: {
        'venuename': selectedVenue
      },
      success: function(data) {
        console.log(data)
        addSearchedMarkersToMap(data, map)
        let lat = data[0][2]
        let lng = data[0][3]
        let position = {lat, lng}
        
        map.setCenter(position);
        map.setZoom(15)
      
      }
    });
  });

  var searchedCafeNamesList = []
  var clickedListCafeNamesList = []
  var markers = []
  var likedVenues = new Set(); //empty array 

  $.ajax({
    type: 'GET',
    url: '/api/liked/',
    data: {
    },
    success: function(data) {
      for (i = 0; i < data.length; i++){
        let likedCafe = data[i].liked_venue.cafe_name;
        likedVenues.add(likedCafe)
      }
    }
  });

  const addSearchedMarkersToMap = function(data, map) {
    searchedCafeNamesList = []
    console.log(searchedCafeNamesList)
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
          putSearchedMarkersOnMap(data, map, listId)
        }
      });
    }
  };

  const putSearchedMarkersOnMap = function(data, map, listId) {
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
      console.log(data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(data[i][2], data[i][3]),
        map: map,
        animation: google.maps.Animation.DROP,
        title: data[i][0],
        icon: svgMarker
      });

      markers.push(marker)

      $.ajax({
        type: 'GET',
        url: '/electra/info_box/',
        data: {
          'venuename': data[i][0]
        },
        success: function(data) {
          console.log(data)

          data.forEach(([cafeId, cafeName, cafeAddress, venueType, source]) => {
            var myCol = $('<div id="col"></div>');
            var myPanel = $(
              `
                <div class="card-group">
                <div class="venue-card card card-block m-3">
                  <div class="venue-card card card-body" id="${cafeName}-cardbody" data-idtext="${cafeName}">
                    <h5 class="card-title venue-name" id="${cafeName}-card" data-idtext="${cafeName}">
                      ${cafeName}
                    </h5>
                    <h6 class="venue-address card-subtitle">${cafeAddress}</h6>
                    <h6 class="venue-source card-subtitle">Added by ${source}</h6>

                    <span class="card-info">
                    <i id="${cafeName}-like" class="card-icon bi bi-heart-fill default-like" data-idtext="${cafeId}"></i>
                    <i id="${cafeName}-bookmark" class="card-icon bi bi-bookmark-plus-fill default-bookmark" data-idtext="${cafeId}"></i>
                    </span>
                  </div>
                </div>
              </div>
              `
            );
            $(".venue-address", myPanel).html(cafeAddress);

            myPanel.appendTo(myCol);
            myCol.appendTo('#indexCardList');

            //check if venue has been liked by the user and add css class if so
            const assignHeartsToAnyLikedVenues = function(cafeName){
              $.ajax({
                type: 'GET',
                url: '/api/liked/',
                data: {
                },
                success: function(data) {
                  console.log(`liked venues are ${data}`)
                  for (i = 0; i < data.length; i++){
                    let likedCafe = data[i].liked_venue.cafe_name;
                    if(likedCafe == cafeName){
                      console.log("Match found" + cafeName)
                      let venueHeart = document.getElementById(cafeName + "-like")
                      console.log(venueHeart)
                      venueHeart.classList.add("liked-venue")
                    }                 
                  }
                }
              });
            };

            assignHeartsToAnyLikedVenues(cafeName)
        
 
            document.getElementById(cafeName + "-card").addEventListener('click', function() {
              console.log(cafeName)
              $('#venue-modal').modal('show');
              $.ajax({
                type: 'GET',
                url: '/electra/info_box/',
                data: {
                  'venuename': cafeName
                },

                success: function(data) {
                  console.log(data)
                  var results = JSON.stringify(data).split('"');
                  console.log(results);
                  var cafeId = results[0];
                  // var cafeName = results[1].replace(/[^a-zA-Z0-9éè ]/g, "");
                  var cafeDescription = results[5].replace(/\n/g, "<br>")
                  $("#modal-venue-title").html(cafeName);
                  $("#modal-venue-address").html(cafeAddress);
                  $("#modal-venue-description").html(cafeDescription);
                  console.log(results);
                }
              });

              var request = {
                query: cafeName,
                fields: ['place_id'],
              };
              console.log(request)

              let testNode = $("#hidden").get(0)
              console.log(testNode)

              var service = new google.maps.places.PlacesService(testNode);
              service.findPlaceFromQuery(request, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                  for (var i = 0; i < results.length; i++) {
                    let placeId = results[i].place_id
                    console.log(placeId)
                    getPlaceDetails(placeId)
                  }
                }
              })

              const getPlaceDetails = function(placeId) {
                console.log(`The venue's ID is ${placeId}`)
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
                    console.log(results);
                    // $("#website").attr("src", results.website)
                    // $("#website").html(results.website)
                    photos = results.photos
                    console.log(photos)
                    photo = photos[0].getUrl({
                      maxWidth: 500,
                      maxHeight: 500
                    })
                    $("#modal-venue-images").attr("src", photo)
                  }
                }
              }
            })

            document.getElementById(cafeName + "-bookmark").addEventListener('click', function(e) {
              let currentVenue = e.target.getAttribute('data-idtext')
              console.log("Bookmarking " + currentVenue)
              addToListModal(currentVenue)
            });

            //liked venu
            document.getElementById(cafeName + "-like").addEventListener('click', function(e) {
              let likedPlace = e.target.getAttribute('data-idtext')
              let venue = document.getElementById(cafeName + "-like")
              console.log(venue)

              if(venue.classList.contains("liked-venue")) {
                console.log("Removing " + likedPlace)
                removeVenueFromliked(likedPlace)
              } else {
                console.log("Liking " + likedPlace)
                addVenueToLiked(likedPlace)
              }
                
            });

            marker.addListener("click", () => {
              let cards = document.getElementsByClassName('venue-card card card-body');
              console.log(cards)
              for (i = 0; i < cards.length; i++) {
                console.log(cards[i])
                if (cards[i].classList.contains('selected-card')) {
                  cards[i].classList.remove("selected-card");
                }
              };

              for (i = 0; i < markers.length; i++) {
                markers[i].setIcon(svgMarker);
              };
              console.log("scrolling")
              scrollToCard()
            });

            const scrollToCard = function() {

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
                  markersCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                  });
                };
              }
            }

            const panToMarker = function(clickedCard, markers) {
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
              console.log("Pan")
              clickedCard = e.target.getAttribute('data-idtext')
              for (i = 0; i < markers.length; i++) {
                markers[i].setIcon(svgMarker);
              };
              panToMarker(clickedCard, markers, data)
            });
          });     
        }
      });
    }
  };

  $("#liked-venues").click(function() {
    console.log("ClickedLike")
    getLikedVenues()
  })

  const getLikedVenues = function(){
    $.ajax({
      type: 'GET',
      url: '/api/liked/',
      data: {
      },
      success: function(data) {
        console.log(data)
        addLikedVenuesToMap(data, map)
      }
    });
  };
  
  const addLikedVenuesToMap = function(data, map) {
    console.log(data)
    likedVenuesList = []
    clearMarkers()
    $("#indexCardList").empty()
    for (i = 0; i < data.length; i++) { //puts markers in the markers set
      likedVenuesList.push(data[i].liked_venue.cafe_name);
    };
    console.log(likedVenuesList)
    gatherListMarkerData(likedVenuesList, map)
  };

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
          putSearchedMarkersOnMap(data, map, listId)
        }
      });
    }
  };

  const putListMarkersOnMap = function(data, map, listId) {
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
      console.log(data[i][0], parseFloat(data[i][2]), parseFloat(data[i][3]))
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(data[i][2], data[i][3]),
        map: map,
        animation: google.maps.Animation.DROP,
        title: data[i][0],
        icon: svgMarker
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
                  <h5 class="card-title venue-name" id="${cafeName}-card" data-idtext="${cafeName}">
                    ${cafeName}
                  </h5>
                  <h6 class="venue-address card-subtitle mb-2 text-muted"></h6>
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
            $(".venue-options", myPanel).html('<i class="bi bi-three-dots"></i>');
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
                if (cards[i].classList.contains('selected-card')) {
                  cards[i].classList.remove("selected-card");
                }
              };
              scrollToCard()
            });

            const scrollToCard = function() {
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
                  markersCard.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest"
                  });
                };
              }
            }

            const panToMarker = function(clickedCard, markers) {
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

  const addToListModal = function(venueToAdd) {
    var userName = document.getElementById("username").innerText;
    console.log(userName);
    console.log("venue ID is " + venueToAdd);
    $("#userListsModal").empty();
    $('#userlist-modal').modal('show');
    // gets the user's lists and adds them to modal
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
  

  $("#userListsModal").on('click', "li", function(e) {
    var listname = e.target.getAttribute('data-name');
    var listId = e.target.getAttribute('data-pk');
    console.log(`The selected venue is ${venueToAdd}`)
    console.log(`Adding ${venueToAdd} to ${listname}:${listId}`);
    addVenueToList(listId, venueToAdd);
    e.preventDefault();
  });
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
    console.log(venueToAdd);
    console.log(listId);

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
        $("#userlist-modal").modal('hide');
        showSnackBar()
      },
    });
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

  const removeVenueFromliked = function(venue_name) {
    $.ajax({
      type: 'GET',
      url: '/electra/remove_venue_from_liked',
      data: {
        'venue': venue_name
      },
      success: function(data) {
        console.log("removed")
        $("#indexCardList").empty()
        showRemovedSuccessSnackBar();
        getLikedVenues()
        
      }
    });
  }
  const removeFromListModal = function(venueName, listId) {
    var userName = document.getElementById("username").innerText;
    console.log(userName);
    console.log(venueName);
    console.log(listId);
    $('#remove-venue-from-list-modal').modal('show');
    $("#remove-text").html(`Are you sure you want to remove ${venueName}?`);
    $("#remove-venue-button").click(function() {
      console.log("clicked remove")
      $('#remove-venue-from-list-modal').modal('hide');
      removeVenueFromList(venueName, listId);
    })
  };

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

  $("#username").click(function() {
    console.log("clicked profile")
    showProfileModal()
  });

  const showProfileModal = function() {
    $("#profile-modal").modal('show');
  };

});

// feedback modal
$("#feedback").click(function() {
  $("#feedback-modal").modal('show');
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

$("#add-place").click(function() {
  $("#add-place-modal").modal('show');
})

$("#submit-suggestion").click(function() {
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

// $("#modern-search").click(function() {
//   toggleSearch()
// })

// const toggleSearch = function(){
//   let activeSearch = $("#modern-search")
//   let searchField = $("#search-field")
  
//   if (!activeSearch.hasClass("pushedsearchbtn")){
//     activeSearch.addClass("pushedsearchbtn")
//     searchField.addClass("open-search")
//   } else {
//     activeSearch.removeClass("pushedsearchbtn")
//     searchField.removeClass("open-search")
//   }
// }

$("#openbtn").click(function() {
  toggleNav()
});

const toggleNav = function() {
  let sideBar = $("#vygr-sidebar")
  let openBtn = $(".openbtn")
  let mapCards = $(".map-venue-cards")
  if (sideBar.hasClass("closed-sidebar")) {
    sideBar.removeClass("closed-sidebar")
    sideBar.addClass("open-sidebar")
    openBtn.addClass("pushedbtn")
    mapCards.addClass("pushedcards")

  } else {
    sideBar.removeClass("open-sidebar")
    sideBar.addClass("closed-sidebar")
    openBtn.removeClass("pushedbtn")
    mapCards.removeClass("pushedcards")
  };
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

const commitNewCafe = function(geocoder, marker, map) {

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
        console.log("The geocoordinates of searched address are " + geoloc);
    
  
  let name = $("#venue-name-box").val()
  console.log(geolat) 
  console.log(geolong)
  let type = $("#venue-type-box").val()
  let description = $("#description-box").val()

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
      'venuedescription': description.replace(/\n/g, "<br>")
    },
    success: function(data) {
      console.log("Data sent");
      location.reload();
    }
  });
};
})
}


console.log("index2.js 0.01");