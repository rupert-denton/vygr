
//ajax call for user location - at the moment (14 September) this uses HTML IP Geolocator but it is very inaccurate
//google maps: AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk


//playlists (should be on sidebar)
$(document).ready(function(){
	console.log('Document Ready')
	$.ajax({
			type: "GET", //gets data (listed below) from views.py user_playlist
			 url : '/playlist',
			 data: {
				 'venue': 'venue',
				 'list':  'list',
				},
					success: function(data){
					$("#playlist").html(data);
					console.log(data)
					},
					failure: function(errMsg) {
						alert(errMsg);
					}
					});
	});

//homepage map
$(document).ready(function(){

//Map Creation
  var script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCaMciXfNXBzO_lPINmrspp4_fZ17RA_Jk&callback=initMap';
  script.defer = true;

  $.ajax({
    type: 'GET',
    url: '/api/userlist/',
    success: function(data) {
        data.forEach((item, i) => { //what does the i refer to
            $("#list-choices").append(`<option value="${item.id}">${item.list_name}</option>`)
        });

    }
  })
  // Get user location
    $("#cafes").text(function(){
      if(navigator.geolocation) {
        //first check if it exists
          console.log("Success")

          var positionOptions = {
          timeout : Infinity,
          maximumAge : 0,
          enableHighAccuracy : true
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

          navigator.geolocation.watchPosition(getPosition, catchError, positionOptions);

           function getPosition(position){
             console.log("Latitude:" + position.coords.latitude + " " + "Longitude:" + position.coords.longitude);
             var lat = parseFloat(position.coords.latitude);
             var long = parseFloat(position.coords.longitude);
             var loc = [lat, long];
             console.log("User location is " + loc);

               // Attach your callback function to the `window` object
               window.initMap = function() {
                 var userloc = {lat: lat, lng: long}; // The location of user
                 map = new google.maps.Map(document.getElementById('map'),
                 {
                 center: userloc, // Centre map on user
                 zoom: 13
                 });
                 console.log("Map done. User loc is " + userloc)

                   const geocoder = new google.maps.Geocoder();
                    document.getElementById("submit").addEventListener("click", () => {
                      geocodeAddress(geocoder, map);
                      });
                    }

                      //user searches after the map has loaded
                      function geocodeAddress(geocoder, resultsMap) {
                        const address = document.getElementById("address").value;
                        geocoder.geocode({ address: address }, (results, status) => {
                          if (status === "OK") {
                            resultsMap.setCenter(results[0].geometry.location);
                            console.log("Successfully geocoded user input");
                            var geolat = parseFloat(results[0].geometry.location.lat());
                            var geolong = parseFloat(results[0].geometry.location.lng());
                            var geoloc = [geolat, geolong];
                            console.log("The geocoordinates of searched address are " + geoloc);

                            //when the user searches the latitude and longitude are passed through an ajax call to views.py
                            $.ajax({
                              type: 'GET',
                              url: '/electra/cafe_list/',
                              data: {
                                'geolat': parseFloat(geolat),
                                'geolong': parseFloat(geolong),
                               },

                              success: function(data) {

                                //cafe-list has now been loaded

                                    $("#cafe_list").html(data)
                                    const cafeList = document.querySelector(".cafe-details"); //this is the overall top level element for the list
                                    cafeList.addEventListener('click', e => { //here an event is being bounded to the events to the ul
                                    if (e.target && e.target.matches('a')) { //this code finds out where in the ul the click happens
                                        e.preventDefault();
                                        const listItem = e.target.closest('li');
                                        var cafeName = listItem.querySelector('.cafe-name').innerText;



                                        // // Now we have the cafe name.
                                        console.log(cafeName);

																				$.ajax({
																					type: 'GET',
																					url: '/api/userlist/',
																					success: function(data) {
																						var chosen_list = data.list_name
																						}
																					})

                                        $('#modal1').modal({show: true});
                                        const modal1 = document.getElementById('modal1');
                                        modal1.addEventListener('click', e => {
                                          if (e.target && e.target.matches('#add-btn')){
                                            console.log('Clicked Add')

																						var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();

																		        function csrfSafeMethod(method) {
																		            // these HTTP methods do not require CSRF protection
																		            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
																		          }

																		        $.ajaxSetup({
																		            beforeSend: function (xhr, settings) {
																		            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
																		              xhr.setRequestHeader("X-CSRFToken", csrftoken);
																		            }
																		          }
																		        });


																		      $.ajax({
																		          type: "POST",
																		           url : '/api/uservenue/',
																		           dataType: "json",
																		           data: {
																		             'venue': $("h6", listItem).data('id'),  //what is this?
																		             'list':  $("#list-choices").find(":selected").attr('value'),
																		             'csrfmiddlewaretoken': document.querySelector('input[name="csrfmiddlewaretoken"]').value,
																		           },

																		              success: function(data){
																		              //$("user-list").html(data);
																		              console.log('User clicked: ' +  data)
																									alert('Added!')

																		              },
																		              failure: function(errMsg) {
																		                alert(errMsg);
																		              }
																		            }); //for some reason this goes up in many multiples?
                                          }
                                          else if (e.target && e.target.matches('#cancel-btn')){
                                            console.log('Clicked Cancel')
                                          }
                                          })
                                              };
                                            });
                                }
                              }) //end ajax brackets
                            }
                                else {
                                alert("Geocode was not successful for the following reason: " + status);
                                }
                              })
                            };


                            // Append the 'script' element to 'head'
                            document.head.appendChild(script);
                          };
                         }
                       })
                      })
                    ;
                  ;


									//this went with the modal add new list
									// $('#modal2').modal({show: false});
									// const modal2 = document.getElementById('modal2');
									// modal1.addEventListener('click', e => {
									// 	if (e.target && e.target.matches('#create-btn')){
									// 		console.log('Clicked Add')
									// 	}
									// })
