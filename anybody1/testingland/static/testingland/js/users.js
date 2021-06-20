window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
    $.ajax({
        type: 'GET',
        url: '/electra/get_users/',
        data: {},
        success: function(data) {        
            for (i = 0; i < data.length; i++) {
                var myCol = $('<div id="col" class="col-sm-4"></div>');
                var myPanel = $(
                    '<div class="card-group"><div class="card"><div class="card-body"><h5 class="card-title" data-idtext='+ data[i] +' id=' + data[i] + '>' + data[i] + '</h5><p class="card-text">Lorem Ipsum...</p><button class="card-btn" data-idtext='+ data[i] +' id=' + data[i] + 'FollowButton>Follow</button><button class="card-btn" data-idtext='+ data[i] +' id=' + data[i]+ 'ViewDashButton>View Dashboard</button></div></div></div>'
                    );
                myPanel.appendTo(myCol);
                myCol.appendTo('#contentPanel');

                document.querySelector("#" + data[i] + "FollowButton").addEventListener('click', function() {
                        var followedUser = $(this).data('idtext');
                        prepareUserDataForConnection(followedUser)
                });

                document.querySelector("#" + data[i] + "ViewDashButton").addEventListener('click', function() {
                    var clickedUser = $(this).data('idtext');
                    console.log("Clicked" + " " + clickedUser);
                    viewDashboard(clickedUser)
                });
            };      
        }            
    }); 
});

const viewDashboard = function(clickedUser){
    console.log("Going to the Dashboard of:" + " " + clickedUser);
    userName = "/" + clickedUser;
    window.location.href = userName;
}

const prepareUserDataForConnection = function(followedUser){
    
    var currentUser = document.getElementById("username").innerText;
    console.log(currentUser);
    console.log(followedUser);

    $.ajax({
        type: 'GET',
        url: '/api/prepareuserinfo/',
        data: {
            'follower': currentUser,
            'followed': followedUser
        },
        success: function(data) {
            console.log(data)
            let currentUserId = data[0].id;
            let followedUserId = data[1].id;
            console.log(currentUserId, followedUserId)
            connectUsers(currentUserId, followedUserId)
        }, 
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
  const csrftoken = getCookie('csrftoken');


const connectUsers = function(currentUserId, followedUserId){

    $.ajax({
        type: 'POST',
        url: '/api/userconnections/',
        dataType: 'json',
        data: {
            csrfmiddlewaretoken: document.querySelector('input[name="csrfmiddlewaretoken"]').value,
            'follower_id': parseInt(currentUserId),
            'followed_id': parseInt(followedUserId)
        },
        success: function(data) {
            alert(`Successfully Followed ${data}`)
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log('ERROR')
            console.log(jqXhr)
        },
    });
}

$("#profile").click(function(){
    console.log("clicked profile")
    showProfileModal()
  });

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
  })

  document.getElementById("dashboard").addEventListener('click', function() {
    var user = document.getElementById("username").innerText;
    console.log(user)
    viewDashboard(user);
  });

  
