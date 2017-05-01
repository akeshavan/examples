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
