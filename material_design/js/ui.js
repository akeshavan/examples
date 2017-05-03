$("#brightness_slider").change(function(e){
  //doBright(e.target.value)
  doBrightCont()
})
$("#contrast_slider").change(function(e){
  //doCont(e.target.value)
  doBrightCont()
})
$("#brightness_slider").on("mouseup",function(e){
  //doBright(e.target.value)
  doBrightCont()
})
$("#contrast_slider").on("mouseup",function(e){
  //doCont(e.target.value)
  doBrightCont()
})

function startProgress(){
  var spot = $("#pbar")
  spot.show()
}

function stopProgress(){
  var spot = $("#pbar")
  spot.hide()
}

function setMenuIcon(mode){

  var all_classnames = "mdi mdi-format-color-fill mdi-eraser-variant mdi-format-clear mdi-arrow-all"
  var component = $(".mdl-layout__header .mdl-layout__drawer-button i")
  component.removeClass(all_classnames)
  component.html("")

  switch (mode) {
    case "paint":
      component.html("brush")
      break
    case "paintFill":
      component.addClass("mdi mdi-format-color-fill")
      break
    case "erase":
      component.addClass("mdi mdi-eraser-variant")
      break
    case "eraseFill":
      component.addClass("mdi mdi-format-clear")
      break;
    case "view":
        component.addClass("mdi mdi-arrow-all")
        break;
    default:
      break
  }
}

blockContextMenu = function (evt) {
  evt.preventDefault();
};

myElement = $('#myCanvas').on('contextmenu', blockContextMenu);



show_eval = function(){
  //var output =  Mustache.render('<h4>Color the MS Lesions <button class="btn btn-primary btn-xsmall" onclick="do_eval()">Evaluate</button></h4>')
  $("#submit_button").html("Submit")
  console.log("setting click to do_eval")
  $("#submit_button").attr("onclick", "do_eval()")
}

show_save = function(score){
  score["acc"] = score["accuracy"].toString()
  score["acc"] = score["acc"].slice(0,4)
  var snackbarContainer = document.querySelector('#demo-toast-example');
  var data = {message: 'Points: ' + score.xp + " Accuracy: " + score.acc,
              timeout: 10000};
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
  //var output = Mustache.render('<h4> accuracy: {{acc}}, points: {{xp}} <button class="btn btn-success btn-xsmall" onclick="get_next()">Next</button> </h4>', score)
  $("#submit_button").html("Next")
  console.log("setting click to get_next")
  $("#submit_button").attr("onclick", "get_next()")
}
