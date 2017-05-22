/* =============================================================================
                              RASTER FUNCTIONS
============================================================================= */

var all_rasters = []

view.onResize = function(){
  /*
    When the window size changes, change the bounds of all rasters
  */
  all_rasters.map(function(r){r.fitBounds(view.bounds)})
}

var initialize_base_raster = function(raster){
  /*
    Initialize the base image raster so that its visible, centered, and takes up
    the width of the window
  */
  raster.visible = true;
  raster.position = view.center;
  raster.fitBounds(view.bounds);
  all_rasters.push(raster)
}



var initialize_roi_raster = function(base_raster, roi_raster, alpha){
  /*
    Initialize the roi image so that its the same size and position of the
    base image, and also set the opacity to alpha (0.25 by default)
  */
  alpha = alpha || 0.25
  roi_raster.setSize(base_raster.size)
  initialize_base_raster(roi_raster)
  roi_raster.opacity = alpha //0.25
  roi_raster.initPixelLog()
  all_rasters.push(roi_raster)
}

Raster.prototype.save_base_colors = function(){
  this.base_colors = {}
  for (x=0;x<this.width;x++){
    this.base_colors[x] = {}
    for (y=0;y<this.height;y++){
      this.base_colors[x][y] = this.getPixel(x,y)
    }
  }
}

Raster.prototype.set_brightness = function(value){
/*
  Set the brightness on the raster, based on value. Value is added to the
  original brightness setting of the image. value +brightness will be clamped
  between 0 and 1.
*/
    for (x=0;x<this.width;x++){
      for (y=0;y<this.height;y++){

        var newColor = this.base_colors[x][y].clone()
        var oldBrightness = newColor.getBrightness()
        newColor.setBrightness(xfm.clamp(oldBrightness + value, 0, 1))
        this.setPixel(x,y,newColor)
      }
    };
}

Raster.prototype.set_contrast = function(value){
/*
  Set the contrast on the raster. value is between 0 and 255.
*/

    var adjust = function(r,f){
      return f*(r-128)+128
    }

    for (x=0;x<this.width;x++){
      for (y=0;y<this.height;y++){

        var newColor = this.base_colors[x][y].clone()

        var oldR = newColor.getRed()*255
        var oldG = newColor.getGreen()*255
        var oldB = newColor.getBlue()*255
        var factor = (259*(value+255))/(255*(259-value))

        var newR = xfm.clamp(adjust(oldR, factor),0,255)/255
        var newG = xfm.clamp(adjust(oldG, factor),0,255)/255
        var newB = xfm.clamp(adjust(oldB, factor),0,255)/255

        newColor.setRed(newR)
        newColor.setGreen(newG)
        newColor.setBlue(newB)
        this.setPixel(x,y,newColor)

      }
    };

}

Raster.prototype.initPixelLog = function(){
  /*
    Adds the pixelLog attribute to the raster. Pixel log is a dictionary with
    index keys (0-width) and each value is another dictionary w/ keys (0-height)
    The values are initialized to null.
  */
  this.pixelLog = {}
  for (ii=0;ii<this.width;ii++){
    this.pixelLog[ii] = {}
    for (jj=0;jj<this.height;jj++){
      this.pixelLog[ii][jj] = 0
    }
  }
}

Raster.prototype.setPixelLog = function(x,y,val,paintVal){
  /*
    Sets the pixel and pixelLog at coordinate x,y to val. Val should be a color.
  */

  x = Math.floor(x)
  y = Math.floor(y)
  this.setPixel(x,y,val)
  try {
    this.pixelLog[x][y]= paintVal //|| val
    return 0
  }
  catch(err){
    console.log(x,y,"out of bounds")
    return 1
  }
}

function doFloodFill(e, me){
  /*
    Starts the recursive flood fill on the raster starting from e.point
  */
  var local = xfm.get_local(e)
  console.log("targetVal", me.pixelLog[local.x][local.y])
  console.log("replacementVal", window.paintVal)
  draw.floodFill(me, local, me.pixelLog[local.x][local.y], window.paintVal)
  draw.reset()
}

function drawLine(e, me){
  /*
    Draws a line from e.point to the previous point
  */
  var local = xfm.get_local(e)
  //console.log("paintval to", draw.LUT[window.paintVal])
  draw.addHistory(local.x, local.y,
                  me.pixelLog[local.x][local.y],
                  window.paintVal)
  me.setPixelLog(local.x, local.y, draw.LUT[window.paintVal], window.paintVal)

  if (draw.last != null){

    draw.line(local.x,
         local.y,
         draw.last.x,
         draw.last.y, draw.LUT[window.paintVal], me, paintVal)
  }
  draw.last = local

}

/* =============================================================================
                          TRANSFORMATION FUNCTIONS
============================================================================= */

xfm = {}

xfm.clamp = function(number, min, max){
  /*
    returns the number if number is between min or max. If number is > max,
    returns max. If number < min, returns min
  */
  max = max || 0
  min = min || 0
  return Math.max(min,Math.min(number, max))

}

xfm.clampPoint = function(point, min, max){
  /*
    returns a Point w/ point.x and point.y clamped between min,max
  */
  min = min || 0
  max = max || 0
  return new Point({x: xfm.clamp(point.x, min,max),
    y: xfm.clamp(point.y, min, max)})

}

xfm.get_local = function(e){
  /*
    super weird coordinate transform. Make the center of the image 0,0 (because
    that is how the local coordinate system is referenced), then
    clamp the point, and then move 0,0 back to the top left for raster pixel
    refence space.
  */
  var width = base.size.width
  var half = width / 2
  var local = base.globalToLocal(e.point)
  var local = xfm.clampPoint(local, 0-half, half)
  local.x =  Math.floor(local.x+half)
  local.y = Math.floor(local.y+half)
  return local
}

/* =============================================================================
                              DRAWING FUNCTIONS
============================================================================= */

draw = {}
draw.last = null
draw.counter = 0
draw.history = [[]]

draw.LUT = {0: {red: 0, green:0, blue:0, alpha:0},
            1:"red",
            2: "cyan",
            3: "gold",
            4: "plum",
            5: "goldenrod"}

draw.reset = function(){
  /*
    reset the last drawn point and the flood fill counter
  */

  draw.last = null
  draw.counter = 0
  window.panFactor.x = 0
  window.panFactor.y = 0
  if (draw.history[draw.history.length-1].length){
  draw.history.push([])}
  //console.log("draw history", draw.history)

}

draw.addHistory = function(x0,y0,oldval,newval){
  /*
    Add an item to history so we can revert. Save coordinates x0, y0,
    and the oldval. Only save to history if there is a change (oldval != newval)
  */
  if (oldval != newval){
    draw.history[draw.history.length-1].push({x:x0, y:y0,
                                            prev:oldval})
  }
}

draw.revert = function(roi){
  /*
    Revert based on history
  */
  if (draw.history.length > 1){
    draw.history.pop() //this one is always empty
    var values = draw.history.pop()
    values.forEach(function(val, idx, arr){
      roi.setPixelLog(val.x,val.y,draw.LUT[val.prev], val.prev)
    })
    draw.history.push([])
    console.log(draw.history)
  }
}

draw.line = function(x0, y0, x1, y1, val, roi, paintVal){
  /*
    Algorithm to connect two points with a line
  */
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;
   var new_arr = []

   while(true){

     draw.addHistory(x0,y0,roi.pixelLog[x0][y0],paintVal)
     roi.setPixelLog(x0,y0, val, paintVal);  // Do what you need to for this

     if (Math.abs(x0-x1) < 0.25 && Math.abs(y0-y1) < 0.25) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }

}


function Queue(item) {
  var inbox = []
  var outbox = [item]
  this.push = function(item) {inbox.push(item)}
  this.pop = function() {
    if (outbox.length === 0) {
      inbox.reverse()
      // swap the inbox and outbox
      var oldOutbox = outbox
      outbox = inbox
      inbox = oldOutbox
    }
    return outbox.pop()
  }
  Object.defineProperty(this, "length", { get: function() {
    return inbox.length + outbox.length
  }})
}


draw.floodFill = function(roi, node, targetVal, replacementVal){
  /*
    flood fill algorithm. roi = roi raster object, node is an object
    with keys x,y that refer to the raster-space pixels
  */
  if (targetVal === replacementVal) {return}
  if (roi.pixelLog[node.x][node.y] != targetVal) {return}
  function neighboors(y) {
    var nei = [];
    if (y > 0) {nei.push(y - 1)}
    if (y < roi.height - 1) {nei.push(y + 1)}
    return nei
  }

  var queue = new Queue(node)
  while (queue.length > 0) {
    node = queue.pop();
    var x = node.x;
    var y = node.y;
    if (roi.pixelLog[x][y] != targetVal) {continue}

    while (x > 0 && roi.pixelLog[x - 1][y] === targetVal) {
      x -= 1;
    }

    var nei = neighboors(y);
    while (x < (roi.width - 1) && roi.pixelLog[x][y] === targetVal) {
      draw.addHistory(x, y, roi.pixelLog[x][y], replacementVal);
      roi.setPixelLog(x, y, draw.LUT[replacementVal], replacementVal);
      for (i = 0; i < nei.length; i++){
        var y_nei = nei[i]
        if (roi.pixelLog[x][y_nei] === targetVal) {
          queue.push({x:x, y:y_nei})
        }
      }
      x += 1;
    }
  }
  return
}

/*=============================================================================
                            CONTROLLER FUNCTIONS
=============================================================================*/

changeMode = function(e){
  /*
    Set the window's mode to e. e is a string. Examples "fill", "paint", etc
  */
  window.mode = e
}

window.paintVal = 1
setPaintbrush = function(e){
  /*
    Set paintbrush value to integer(e). If e is not in the draw.LUT, set to 0.
  */
  if (Object.keys(draw.LUT).indexOf(e)<0){
    console.log("value not in lookup table. setting paintbrush to 0")
    e = 0
  }

  window.paintVal = parseInt(e)
}

window.zoomFactor = 1

doZoom = function(e){
  /*
    Zoom based on how far the user drags in the y direction
  */
  var zoomFactor = window.zoomFactor + e.delta.y/200
  window.zoomFactor = xfm.clamp(zoomFactor, 1, 3)
  view.setZoom(window.zoomFactor)
}

window.panFactor = {x:0, y:0}
window.totalPan = {x:0, y:0}

doPan = function(e){
  /*
    Pan based on how far the user drags in the x/y direction
  */
  window.panFactor.x = window.panFactor.x + e.delta.x/100
  window.panFactor.y = window.panFactor.y + e.delta.y/100

  window.totalPan.x = window.totalPan.x + e.delta.x/100
  window.totalPan.y = window.totalPan.y + e.delta.y/100

  view.translate(window.panFactor.x, window.panFactor.y)
}

doBright = function(e){
  /*
    Adjust brightness based on how far left/right of the center is clicked.
    Adjust contrast based on how far up/down of the center is clicked.
  */
  var amount = xfm.get_local(e)
  var half = all_rasters[0].width/2
  amount.x = (amount.x - half)/half
  amount.y = (amount.y - half)/half
  console.log("amount is", amount)

  all_rasters[0].set_brightness(amount.x)
  all_rasters[0].set_contrast(amount.y*255)
}

dragHandler = function(e){
  /*
    What to do when the user drags based on the window.mode
  */
  var me = this
  var mode = window.mode
  switch (mode) {
    case "paint":
      drawLine(e, me)
      break
    case "zoom":
      doZoom(e)
      break
    case "pan":
      doPan(e)
      break;

    default:
      break
  }
}

clickHandler = function(e){
  /*
    What to do when the user clicks based on window.mode
  */
  var me = this
  var mode = window.mode
  switch (mode) {
    case "fill":
      doFloodFill(e, me)
      break;
    case "brightness":
      doBright(e)
      break
    default:
      break

  }
}

/* =============================================================================
                                    MAIN
==============================================================================*/

//Load the base image
var base = new Raster('mona');
initialize_base_raster(base)
base.save_base_colors()

//Load the (blank) ROI image
var roi = new Raster({});
initialize_roi_raster(base, roi)

// ROI events
roi.onMouseDrag = dragHandler //drawLine
roi.onMouseUp = draw.reset
roi.onClick = clickHandler //doFloodFill

//default mode:
window.mode = "paint"

//DEBUG: Set some global variables
window.base = base
window.roi = roi
window.view = view
