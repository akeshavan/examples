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
			this.pixelLog[ii][jj] = null
		}
	}
}

Raster.prototype.setPixelLog = function(x,y,val){
	/*
		Sets the pixel and pixelLog at coordinate x,y to val. Val should be a color.
	*/

	x = Math.floor(x)
	y = Math.floor(y)
	this.setPixel(x,y,val)
	try {
		this.pixelLog[x][y]=val
		return 0
	}
	catch(err){
		console.log(x,y,"out of bounds")
		return 1
	}
}

function doFloodFill(e){
	/*
		Starts the recursive flood fill on the raster starting from e.point
	*/
	var local = xfm.get_local(e)
	draw.floodFill(this, local)
	draw.reset()
}

function drawLine(e){
	/*
		Draws a line from e.point to the previous point
	*/
	var local = xfm.get_local(e)

	this.setPixelLog(local.x, local.y, "red")

  if (draw.last != null){

    draw.line(local.x,
         local.y,
         draw.last.x,
         draw.last.y, "red", this)
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

draw.reset = function(){
  /*
    reset the last drawn point and the flood fill counter
  */
  draw.last = null
  draw.counter = 0
}

draw.line = function(x0, y0, x1, y1, val, roi){
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

     roi.setPixelLog(x0,y0, val);  // Do what you need to for this

     if (Math.abs(x0-x1) < 0.25 && Math.abs(y0-y1) < 0.25) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }

}

draw.floodFill = function(roi, node){
	/*
    Recursive flood fill algorithm. roi = roi raster object, node is an object
    with keys x,y that refer to the raster-space pixels
  */
  if(draw.counter > 5500){
    // too close to stack limit
    return}


	var node_red = roi.getPixel(node).red

	var target_red = 0
	var replacement_red = 1
	if (target_red == replacement_red){return}
	if (node_red != target_red){return}
  if (node.x >= roi.width){return}
  if (node.x < 0){return}
  if (node.y >= roi.height){return}
  if (node.y < 0){return}


	roi.setPixelLog(node.x, node.y,"red")
  draw.counter++
	draw.floodFill(roi, {x:node.x-1, y:node.y})
	draw.floodFill(roi, {x:node.x+1, y:node.y})
	draw.floodFill(roi, {x:node.x, y:node.y-1})
	draw.floodFill(roi, {x:node.x, y:node.y+1})
  return
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
roi.onMouseDrag = drawLine
roi.onMouseUp = draw.reset
roi.onClick = doFloodFill

//DEBUG: Set some global variables
window.base = base
window.roi = roi
window.view = view
