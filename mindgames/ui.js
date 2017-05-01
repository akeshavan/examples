activate = function(command){

  //console.log("commnd is", '$("#'+command+'").tab("show")')
  window.prevMode = window.mode
  if (command  == "undo"){
    draw.revert(roi)
  }
  else if (command =="do_hide") {
    hide()
  }
  /*else if (command == "fill"){
    var a = $("#fill a")
    a.css("background-color", "firebrick")
    window.paintVal ? $("#paint a").css("background-color", "steelblue") : $("#erase a").css("background-color", "steelblue")
    !window.paintVal ? $("#paint a").css("background-color", null) : $("#erase a").css("background-color", null)
    changeMode(command)

  }*/
  else{
    var a = $("#fill a")
    //a.css("background-color", "black")

    changeMode(command)
  }

}

highlight_active = function(){

  $("#"+window.mode).tab("show")
}

show_eval = function(){
  var output =  Mustache.render('<h4>Color the MS Lesions <button class="btn btn-primary btn-xsmall" onclick="do_eval()">Evaluate</button></h4>')
  $("#submission_info").html(output)
}

show_save = function(score){
  score["acc"] = score["accuracy"].toString()
  score["acc"] = score["acc"].slice(0,4)
  var output = Mustache.render('<h4> accuracy: {{acc}}, points: {{xp}} <button class="btn btn-success btn-xsmall" onclick="get_next()">Next</button> </h4>', score)
  $("#submission_info").html(output)
}
