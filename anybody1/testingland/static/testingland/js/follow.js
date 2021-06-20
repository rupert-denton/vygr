var followerList = $('#follower-list');
var followingList = $("#following-list");
var followingprofiles = $("#following-profiles");


// list click validation
$("#follower-list").click(function(){
    if (followingList.hasClass("connection-list")){
        followingList.removeClass('connection-list')
        };
    // if ($("#following-profiles").hasClass("following-profiles")){
    //     followingprofiles.toggle();
    // };
    followerList.addClass('connection-list');
    
});

$("#following-list").click(function(){
    if (followerList.hasClass("connection-list")){
        followerList.removeClass('connection-list')
        };
        // if ($("#following-profiles").hasClass("following-profiles")){
        //     followingprofiles.toggle();
        // };
        
    followingList.addClass('connection-list');
});

// follower list function
$("#following-list").click(function(){
    var userData = [];
    var userName = document.getElementById("username").innerText
    console.log(userName);

    $.ajax({
        type: 'GET',
        url: '/api/currentuserinfo/',
        data: {
            'current_user': userName
        },
        success: function(data) {
            console.log(data)
            let currentUserId = data[0].id;
            console.log('Current User Pk is: ' + currentUserId);
            userData.push(currentUserId);
            getWhoUserFollows(currentUserId)
        }, 
    });

    const getWhoUserFollows = function(currentUserId){
        $.ajax({
            type: 'GET',
            url: '/api/following/',
            data: {
              'current_user_id': currentUserId
            },
            success: function(data) {
                data.forEach(item => {
                    var name = item.followed.username;
                    var id = item.followed.id;
                    $("#following-profiles").append(
                        `<ul class="list-group list-group-flush">
                            <ul id="${name}" 
                                class="connection-profile-li userlist-group-item border-top" 
                                    data-idtext=${name}>
                                        ${name}:${id}
                                        <button id="${name} btn" data-idtext=${name}>Unfollow</button>
                            </ul>
                        </ul>`
                        )    
                        // document.querySelector("#" + name).addEventListener('click', function() {
                        //     var clickedUser = $(this).data('idtext');
                        //     console.log("Clicked" + " " + clickedUser); 
                        //     viewDashboard(clickedUser) 
                        // });

                        document.querySelector("#" + name).addEventListener('click', function() {
                            let currentUser = 'anna_denton'
                            let clickedUser = $(this).data('idtext');
                            console.log(clickedUser)
                            let clickedUserId = id
                            unfollowUser(currentUser, currentUserId, clickedUser, clickedUserId)
                        });
    
                });     
            }
        });
    }
    
});

$("#follower-list").click(function(){
    var userData = [];
    var userName = document.getElementById("username").innerText
    console.log(typeof userName);

    $.ajax({
        type: 'GET',
        url: '/api/currentuserinfo/',
        data: {
            'current_user': userName
        },
        success: function(data) {
            let currentUserId = data[0].id;
            console.log('Current User Pk is: ' + currentUserId);
            userData.push(currentUserId);
            getWhoFollowsUser(currentUserId)
        }, 
    });

    const getWhoFollowsUser = function(currentUserId){
        $.ajax({
            type: 'GET',
            url: '/api/follower/',
            data: {
            'current_user_id': currentUserId
            },
            success: function(data) {
                data.forEach(item => {
                    var name = item.follower.username;
                    var id = item.follower.id;
                    console.log(id)
                    $("#follower-profiles").append(
                        `<ul class="list-group list-group-flush">
                            <ul id="${name}" 
                                class="connection-profile-li userlist-group-item border-top" 
                                    data-idtext=${name}>
                                        ${name} : ${id}
                            </ul>
                        </ul>`
                        )    
                        document.querySelector("#" + name).addEventListener('click', function() {
                            var clickedUser = $(this).data('idtext');
                            console.log("Clicked" + " " + clickedUser); 
                            viewDashboard(clickedUser) 
                        });
    
                });     
            }
        });
    }  
});

const unfollowUser = function(currentUser, currentUserId, clickedUser, clickedUserId){
    console.log("Logged in user: " + currentUser + " PK: " + currentUserId + " is unfollowing " + clickedUser + " PK: " + clickedUserId);

    $.ajax({
        type: 'GET',
        url: '/api/deleteconnection/',
        data: {
            'follower': currentUserId,
            'followed': clickedUserId
        },
        success: function(data) {
            alert("Success")
        }  
    });
};

const viewDashboard = function(clickedUser){
    console.log("Going to the Dashboard of:" + " " + clickedUser);
    userName = "/" + clickedUser;
    window.location.href = userName;
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

