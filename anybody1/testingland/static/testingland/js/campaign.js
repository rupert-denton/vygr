
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
  search()
});

// document.getElementById("search_cafe").addEventListener("click", () => {
//   console.log("Clicked!")
//   getSearchedCafe();
// })

document.getElementById("save").addEventListener("click", () => {
  console.log("Clicked Save!")
  savePromotionCampaign();
})


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
        data.forEach(([cafeName]) => {
          var cafeName = cafeName;
          var searchList = $(
            `<div>
                    <li class="list-item border-top" data-idtext="${cafeName}" id="${cafeName}">${cafeName}</li>
                </div>`
          );
          searchList.appendTo('#search-results');
        });
  
        $("ul").click(function(event) {
          var selectedVenue = event.target.id;
          $("#search-results").empty()
          console.log("Clicked" + " " + selectedVenue);
          getVenueDetails(selectedVenue)
        });
      }
    });
};

const getVenueDetails = function(selectedVenue) {
  $.ajax({
    type: 'GET',
    url: '/electra/get_searched_venue_details/',
    data: {
      'venuename': selectedVenue
    },
    success: function(data) {
      console.log(data)
      let venueId = data[0][0]
      let venueName = data[0][1]
      let venueAddress = data[0][2]
      $('#venue-id-div').html(venueId);
      $('#venue-name-div').html(venueName);
      $('#venue-address-div').html(venueAddress);
    }
  });
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

const savePromotionCampaign = function() {
  var id = document.getElementById("venue-id-div").innerHTML
  var promo_venue = document.getElementById("venue-name-div").innerHTML;
  var promo_title = document.getElementById("campaign-title").value;
  var promo_quantity = document.getElementById("voucher-quantity").value;

  var details = [id, promo_venue, promo_title, promo_quantity]
  console.log(details)
    $.ajax({
      type: 'POST',
      url: '/api/promotion/',
      data: {
        csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        "promo_venue": id,
        "promo_title": promo_title,
        "promo_quantity": promo_quantity
      },
      success: function(data) {
        alert("Data sent");
      }
    });
}
