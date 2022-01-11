var venue = $("#venue-name-page").html();
var service;
var currentVenue = "";

function initMap() {
  getComments(venue)

  $.ajax({
    type: 'GET',
    url: '/electra/info_box/',
    data: {
      'venuename': venue
    },

    success: function(data) {
      console.log(data)
      var results = JSON.stringify(data).split('"');
      console.log(results);
      var cafeId = results[0];
      var cafeName = results[1].replace(/[^a-zA-Z0-9éè ]/g, "");
      var cafeAddress = results[2].replace(/[^a-zA-Z0-9éè ]/g, "") + "," + results[3].replace(/[^a-zA-Z0-9éè ]/g, "");
      var cafeDescription = results[5].replace(/\n/g, "<br>")
      $("#venue-description").html(cafeDescription);
      console.log(results);
    }
  });

  var request = {
    query: venue,
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
        $("#website").attr("src", results.website)
        $("#website").html(results.website)
        photos = results.photos
        console.log(photos)
        photo = photos[0].getUrl({
          maxWidth: 500,
          maxHeight: 500
        })
        $("#venue-images").attr("src", photo)

        //   for(let i=0; i<photos.length; i++){
        //       console.log(`height is ${photos[i].height} width is ${photos[i].width}`);
        //       if (photos[i].height !== "5616" && photos[i].width !== "3744"){
        //         photo = photos[i].getUrl({maxWidth: 500, maxHeight: 500})
        //         $("#venue-images").attr("src", photo)
        //       }
        //   }
        //comments
        let googleReviews = results.reviews
        for (let i = 0; i < googleReviews.length; i++) {
          let userName = googleReviews[i].author_name;
          let userImage = googleReviews[i].profile_photo_url;
          let commentText = results.reviews[i].text;
   

          var userComments = $(
            `
                    <div class="bg-white p-2 ml-3 mt-3 border rounded">
                        <div class="d-flex flex-row align-items-start user-info">
                        <img class="rounded-circle" src="${userImage}" width="40">
                            <div class="d-flex flex-column justify-content-start ml-2">
                                <span id="commenter-${userName}" data-name="commenter-${userName}" class="d-block font-weight-bold name">${userName}</span>
                                <span class="date text-black-50">Shared publicly - Jan 2020</span>
                            </div>
                        </div>
                        <div class="mt-2" id="${userName}-comment" data-name="${userName}-comment">
                        <p class="comment-text">${commentText}</p>
                        </div>
                        <div class="d-flex flex-row fs-12">
                                <div class="like p-2 cursor"><i class="fa fa-thumbs-o-up"></i><span class="ml-1">Like</span></div>
                                <div class="like p-2 cursor" id="reply"><span class="ml-1">Reply</span></div>
                            </div>
                    </div>
                    `
          );
          userComments.appendTo('.comment-section');
        }
      }
    }
  };

}

//comments
$("#post-comment").click(function() {
  let commentData = $("#comment-area").val()
  if (!commentData) {
    alert("Please Write a Comment")
  } else {
    postComment(commentData)
  };
})

venue_pk = []

const getComments = function(venue) {

  console.log("x")
  $.ajax({
    type: 'GET',
    url: '/api/venuecomments/',
    data: {
      'venue': venue
    },
    success: function(data) {
      data.forEach(data => {
        let userName = data.user.username
        let commentText = data.comment
        let venue_id = data.venue.id;
        venue_pk.push(venue_id);

        console.log(data)
        var userComments = $(
          `
                    <div class="bg-white p-2 ml-3 mt-3 border rounded">
                        <div class="d-flex flex-row align-items-start user-info">
                        <img class="rounded-circle" src="" width="40">
                            <div class="d-flex flex-column justify-content-start ml-2">
                                <span id="commenter-${userName}" data-name="commenter-${userName}" class="d-block font-weight-bold name">${userName}</span>
                                <span class="date text-black-50">Shared publicly - Jan 2020</span>
                            </div>
                        </div>
                        <div class="mt-2" id="${userName}-comment" data-name="${userName}-comment">
                        <p class="comment-text">${commentText}</p>
                        </div>
                        <div class="d-flex flex-row fs-12">
                                <div class="like p-2 cursor"><i class="fa fa-thumbs-o-up"></i><span class="ml-1">Like</span></div>
                                <div class="like p-2 cursor" id="reply"><span class="ml-1">Reply</span></div>
                            </div>
                    </div>
                    `
        );
        userComments.appendTo('.comment-section');
      });
    }
  });
};


$("#add-to-list").click(function() {
  let venueName = $("#venue-name-page").html();
  console.log(venueName)
});

$("#submit").click(function() {
  console.log("clicked profile")
});

// feedback modal
$("#feedback").click(function(){
  console.log("hey")
  $("#feedback-modal").modal('show'); 
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

const postComment = function(commentData) {
  let venueId = venue_pk[0]
  console.log(`Posting ${commentData}`);
  console.log(`Posting to ${venueId}`);

  $.ajax({
    type: "POST",
    url: '/api/venuecomments/',
    dataType: 'json',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'comment': commentData,
      'venue_id': venueId
    },
    success: function(data) {
      console.log('User added: ' + data)
    },
  });
};


$("#submit-feedback").click(function(){
  let user = $("#feedback-name").val();
  let typeOfFeedback = $("#feedback-type").val();
  let description = $("#feedback-description").val();
  console.log(user)
  console.log(typeOfFeedback + " " + description)
})

$("#suggest-place").click(function(){
  $("#suggestion-modal").modal('show'); 
})

$("#submit-suggestion").click(function(){
  let user = $("#suggestor").val();
  let venueName = $("#suggestion-name").val();
  let venueType = $("#venue-type").val();

  let address = $("#suggestion-address").val();
  console.log(user)
  console.log(venueName + " " + venueType + " " + address)
})

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

document.getElementById("add-to-list").addEventListener('click', function() {
  let venueName = $("#venue-name-page").html();
  console.log(venueName)
  addToListModal(venueName)
});

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
  var currentVenue = $("#venue-name-page").html();

  $.ajax({
    type: 'GET',
    url: '/electra/info_box/',
    data: {
      'venuename': currentVenue
    },
    success: function(data) {
      console.log(data)
      let venueId = data[0][0]
      console.log(`Adding ${venueId} to ${listname}:${listId}`);
      addVenueToList(listId, venueId);
      e.preventDefault();
    }
});
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

const addVenueToList = function(listId, venueId) {
  console.log(venueId);
  console.log(listId);

  $.ajax({
    type: "POST",
    url: '/api/uservenue/',
    dataType: 'json',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'user_list': listId,
      'venue': venueId
    },
    success: function(data) {
      $("#userlist-modal").modal('hide');
      showSnackBar()
    },
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