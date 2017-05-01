function Login(callback){

var profile = store.get("github_profile")
currentData = null
if (profile){
  var output = Mustache.render('<h4><img class="img-circle" width="25px" height="25px" style="margin-right:10px;" src="{{avatar_url}}"/>{{login}}</h4>', profile)
  $("#login_info").html(output)
  callback()
}
else{
  try {
    var code = window.location.href.match(/\?code=(.*)/)[1];
    $.getJSON('https://aqueous-reef-70776.herokuapp.com/authenticate/'+code, function(data) {
      console.log("data token is", data.token);
      getProfile(data.token, function(profile){
        console.log(profile)
        var output = Mustache.render('<h4><img class="img-circle" width="25px" height="25px" style="margin-right:10px;" src="{{avatar_url}}"/>{{login}}</h4>', profile)
        $("#login_info").html(output)
        if (history.pushState) {
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.pushState({path:newurl},'',newurl);
        }
        store.set("github_profile", profile)
        callback()
      })
    });

  } catch (e) {
    var dialog = bootbox.dialog({
      title: 'Click to Login with GitHub:',
      message: '<a href="https://github.com/login/oauth/authorize?client_id=bdf880910c19a91f4a7f" style="color: black;"> <img src="./Octocat.jpg" width="100%"/></a>'
    });
  }
}

function getProfile (token, callback) {
  var options = {
    url: 'https://api.github.com/user',
    json: true,
    headers: {
      authorization: 'token ' + token
    }
  }
  console.log("going to call AJAX")
  $.ajax({
      url: 'https://api.github.com/user',
      headers: {
        authorization: 'token ' + token
      },
      success: function(data, status, jqxhr){
        callback(data)
      }
  });

}
}
