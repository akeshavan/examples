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
	console.log("draw history", draw.history)

}

draw.addHistory = function(x0,y0,oldval,newval){
	if (oldval != newval){
		draw.history[draw.history.length-1].push({x:x0, y:y0,
																						prev:oldval,
																						curr: newval})
	}
}

draw.revert = function(roi){
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

draw.floodFill = function(roi, node, targetVal, replacementVal){
	/*
    Recursive flood fill algorithm. roi = roi raster object, node is an object
    with keys x,y that refer to the raster-space pixels
  */
  if(draw.counter > 5500){
    // too close to stack limit
    return}


	var node_red = roi.pixelLog[node.x][node.y] //.getPixel(node).red
	//console.log("node res is", node_red, node.x, node.y)
	var target_red = targetVal //|| 0
	var replacement_red = replacementVal //|| 1
	if (target_red == replacement_red){
		console.log("target is replacement", target_red, replacement_red)
		return}
	if (node_red != target_red){return}
  if (node.x >= roi.width){return}
  if (node.x < 0){return}
  if (node.y >= roi.height){return}
  if (node.y < 0){return}

	draw.addHistory(node.x, node.y, roi.pixelLog[node.x][node.y], replacement_red)
	roi.setPixelLog(node.x, node.y, draw.LUT[replacement_red], replacement_red)

  draw.counter++
	draw.floodFill(roi, {x:node.x-1, y:node.y}, target_red, replacement_red)
	draw.floodFill(roi, {x:node.x+1, y:node.y}, target_red, replacement_red)
	draw.floodFill(roi, {x:node.x, y:node.y-1}, target_red, replacement_red)
	draw.floodFill(roi, {x:node.x, y:node.y+1}, target_red, replacement_red)
  return
}

/*=============================================================================
														CONTROLLER FUNCTIONS
=============================================================================*/

changeMode = function(e){
	window.mode = e
}

Undo = function(){
	console.log("want to undo")
}

window.paintVal = 1
setPaintbrush = function(e){

	if (Object.keys(draw.LUT).indexOf(e)<0){
		console.log("value not in lookup table. setting paintbrush to 0")
		e = 0
	}

	window.paintVal = parseInt(e)
}

window.zoomFactor = 1

doZoom = function(e){
	var zoomFactor = window.zoomFactor + e.delta.y/200
	window.zoomFactor = xfm.clamp(zoomFactor, 1, 3)
	view.setZoom(window.zoomFactor)
}

window.panFactor = {x:0, y:0}
window.totalPan = {x:0, y:0}

doPan = function(e){
	window.panFactor.x = window.panFactor.x + e.delta.x/100
	window.panFactor.y = window.panFactor.y + e.delta.y/100

	window.totalPan.x = window.totalPan.x + e.delta.x/100
	window.totalPan.y = window.totalPan.y + e.delta.y/100

	view.translate(window.panFactor.x, window.panFactor.y)
}

dragHandler = function(e){
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
			//console.log("default")
			break
	}
}

clickHandler = function(e){
	var me = this
	var mode = window.mode
	switch (mode) {
		case "fill":
			doFloodFill(e, me)
			break;
		default:
			//console.log("default")

	}
}

/* =============================================================================
                                    MAIN
==============================================================================*/

//Load the base image
var base = new Raster('mona');
initialize_base_raster(base)

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
