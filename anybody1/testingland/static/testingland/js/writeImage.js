
document.getElementById("get_cafe").addEventListener("click", () => { 
console.log("Clicked!")
getCafe();
})

document.getElementById("search_cafe").addEventListener("click", () => { 
console.log("Clicked!")
getSearchedCafe();
})

document.getElementById("show-image").addEventListener("click", () => { 
console.log("Clicked!")
showImage(); 
})

document.getElementById("save").addEventListener("click", () => { 
console.log("Clicked Save!")
saveImage(); 
})

$("#search-box").keyup(function() {
  search()  
});
  

function search(){
  let searchTerm = document.getElementById("search-box").value;
      $.ajax({
        type: 'GET',
        url: '/electra/search/',
        data: {
          'search_term':searchTerm
        },
        success: function (data) {
            for (i = 0; i < data.length; i++) {
              var searchList = $(
                  `
                  <div>
                      <ul class="list-item border-top" data-idtext=`+ data[i][0] +` id=` + data[i][0] + `>` + data[i][0] + "," + " " + data[i][1] +`</ul>
                  </div>
                  `
                  );
              searchList.appendTo('#search-results');
            }
          }
      });
  };


function getCafe(){
    $.ajax({
      type: 'GET',
      url: '/electra/get_cafe_without_image/',
      data: {
      },
      success: function (data) {
          console.log(data); //refer to below function for the running of this loop
          showCafeName(data);
        }
      });
}

const getSearchedCafe = function() {
  let cafeName  = document.getElementById("search-box").value;
  console.log(cafeName)
  $.ajax({
    type: 'GET',
    url: '/electra/get_searched_image/',
    data: {
      'venuename':cafeName
    },
    success: function (data) {
        console.log(data); //refer to below function for the running of this loop
        showCafeName(data);
      }
    });
} 

const showCafeName = function(ajaxData) {
  let cafeName = (ajaxData[0]);
  document.getElementById("cafe-name-div").innerHTML=cafeName[0];
  document.getElementById("cafe-address-div").innerHTML=cafeName[1];
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

const saveImage = function () {
  let embedCode  = document.getElementById("embed-box").value;
  let name = document.getElementById("cafe-name-div").innerHTML;
  $.ajax({
    type: 'POST',
    url: '/add_image/',
    data: {
      csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
      'venuename': name,
      'embedcode': embedCode,
    },
    success: function(data) {
      alert("Data sent");
    }
  });
}
    
const showImage = function(){
  let embedCode  = document.getElementById("embed-box").value;
  document.getElementById("image").innerHTML = embedCode;
}