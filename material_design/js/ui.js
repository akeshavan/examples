$("#brightness_slider").change(function(e){
  doBright(e.target.value)
})
$("#contrast_slider").change(function(e){
  doCont(e.target.value)
})
$("#brightness_slider").on("mouseup",function(e){
  doBright(e.target.value)
})
$("#contrast_slider").on("mouseup",function(e){
  doCont(e.target.value)
})

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
  //score["acc"] = score["accuracy"].toString()
  //score["acc"] = score["acc"].slice(0,4)
  //var output = Mustache.render('<h4> accuracy: {{acc}}, points: {{xp}} <button class="btn btn-success btn-xsmall" onclick="get_next()">Next</button> </h4>', score)
  $("#submit_button").html("Next")
  console.log("setting click to get_next")
  $("#submit_button").attr("onclick", "get_next()")
}
