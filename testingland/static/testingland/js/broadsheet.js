var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap&map_ids=33df39eac4360b95';
script.defer = true;

    window.initMap = function() {
    
        //geocoder
        const geocoder = new google.maps.Geocoder();

        document.getElementById("scrape").addEventListener("click", () => { 
        console.log("Clicked!")
        scrapeBroadsheetCafes(geocoder); 
        })

        document.getElementById("save").addEventListener("click", () => { 
        console.log("Clicked Save!")
        saveCafeList(cafeNamesList, cafeAddressList, cafeLatitudeList, cafeLongitudeList); 
        })

        
  }
  document.head.appendChild(script);


$(document).ready(function() {
console.log("Welcome to Broadsheet World");
});

var cafeNamesList = []
var cafeAddressList = []
var cafeLongitudeList = []
var cafeLatitudeList = []
var zippedList = [cafeNamesList, cafeAddressList, cafeLatitudeList, cafeLongitudeList];
console.log(zippedList);

//scrapes cafes
const scrapeBroadsheetCafes = function (geocoder) {
  let city = document.getElementById("city").value; 
  let area = document.getElementById("area").value; 
  $.ajax({
    type: 'GET',
    url: '/electra/broadsheet_scraper/',
    data: {
      'city': city,
      'area': area,
    },
    success: function (data) {
      setTimeout(addToTable,100, data, geocoder, 0); //set timeout overcomes google api query-limit
      }
    });
}

//adds scraped data to table (address, name) (raditha did a whole bunch of stuff here to make this async and not a for loop)
function addToTable(data, geocoder, i)
{
  const table = document.getElementById("testBody");
  if (i == data[0][0].length) {
    return;
  }
  let row = table.insertRow();
  let name = row.insertCell(0);
  name.innerHTML = data[0][0][i]; 
    name.id = data[0][0][i];
  cafeNamesList.push(name.innerHTML)
  let location = row.insertCell(1);
  location.innerHTML = data[0][1][i]; 
    location.id = data[0][1][i];
  cafeAddressList.push(location.innerHTML);
  let address = location.innerHTML;

  geocoder.geocode({
    address: address
  }, (results, status) => {
    if (status === "OK") { 
      var geolat = parseFloat(results[0].geometry.location.lat());
      var geolong = parseFloat(results[0].geometry.location.lng());
      let latitude = row.insertCell(2);
        latitude.innerHTML = geolat;
        cafeLatitudeList.push(latitude.innerHTML);
      let longitude = row.insertCell(3);
        longitude.innerHTML = geolong;
        cafeLongitudeList.push(longitude.innerHTML);
        setTimeout(addToTable, 100, data, geocoder, i+1);
    }
  })
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

const saveCafeList = function (cafeNamesList, cafeAddressList, cafeLatitudeList, cafeLongitudeList) {
  const ajaxList = [cafeNamesList, cafeAddressList, cafeLatitudeList, cafeLongitudeList];
  console.log(ajaxList);
  
  // for (let i = 0; i < ajaxList.length; i++){
    $.ajax({
      type: 'POST',
      url: '/add_broadsheet/',
      data: {
        csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
        'cafeNames': JSON.stringify(cafeNamesList),
        'cafeAddresses': JSON.stringify(cafeAddressList),
        'cafeType': 'cafe',
        'cafeLatitudes': JSON.stringify(cafeLatitudeList),
        'cafeLongitudes': JSON.stringify(cafeLongitudeList)
      },
      success: function(data) {
        console.log("Data sent");
      }
    });
  
}


// <div class="venue-options" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></div>
//                     <div id="${cafeName}-dropdown" class="venue-card-dropdown dropdown-menu" aria-labelledby="dropdownMenuButton">
//                       <a id="share ${cafeName}" data-idtext="share-${cafeName}" class="dropdown-item" href="#">Share</a>
//                       <a id="add ${cafeName}" data-idtext="${cafeId}" class="dropdown-item add" href="#">Add to List</a>
//                   </div>


// document.getElementById(cafeName + "-dropdown").addEventListener('click', function(e) {
//   if (e.target && e.target.matches("a.add")) {
//     console.log(e.target.id)
//     currentVenue = e.target.getAttribute('data-idtext')
//     addToListModal(currentVenue)
//   };
// });