function Brain(container_id, data_path, render_canvas)
{

    var data_path = data_path || "lrh3.ply"
    var ex = {}
    ex.render={};
    ex.render.container=$(container_id);
    console.log()
    var container=ex.render.container;
    var width=container.width();
    var height=container.height();
    console.log(container, width, height)

    // create a scene
    ex.render.scene = new THREE.Scene();

    // create raycaster (for hit detection)
    //container[0].addEventListener('mousedown', function(e){onDocumentMouseDown(e, eid, ex);}, false);

    // put a camera in the scene
    ex.render.camera    = new THREE.PerspectiveCamera(40,width/height,25,50);
    ex.render.camera.position.set(0, 0, 40);
    ex.render.scene.add(ex.render.camera);

    // create a camera control
    ex.render.cameraControls=new THREE.TrackballControls(ex.render.camera,ex.render.container[0])
    ex.render.cameraControls.noZoom=true;
    ex.render.cameraControls.addEventListener('change', function(){ex.render.light.position.copy( ex.render.camera.position );});

    // allow 'p' to make screenshot
    //THREEx.Screenshot.bindKey(renderer);

    // Add lights
    var light   = new THREE.AmbientLight( 0x3f3f3f);
    ex.render.scene.add(light );
    ex.render.light = new THREE.PointLight( 0xffffff,2,80 );
    //var   light   = new THREE.DirectionalLight( 0xffffff);
    //light.position.set( Math.random(), Math.random(), Math.random() ).normalize();
    ex.render.light.position.copy( ex.render.camera.position );
    //light.position.set( 0,0,0 );
    ex.render.scene.add(ex.render.light );

    // Load mesh (ply format)
    var oReq = new XMLHttpRequest();
    oReq.open("GET", data_path, true);
    oReq.responseType="text";
    oReq.onload = function(oEvent)
    {
        var tmp=this.response;
        var modifier = new THREE.SubdivisionModifier(1);

        ex.render.material=new THREE.ShaderMaterial({
            uniforms: {
                coeficient  : {
                    type    : "f",
                    value   : 1.0
                },
                power       : {
                    type    : "f",
                    value   : 2
                },
                glowColor   : {
                    type    : "c",
                    value   : new THREE.Color('grey')
                },
            },
            vertexShader    : [ 'varying vec3   vVertexWorldPosition;',
                                'varying vec3   vVertexNormal;',
                                'void main(){',
                                '   vVertexNormal   = normalize(normalMatrix * normal);',
                                '   vVertexWorldPosition    = (modelMatrix * vec4(position, 1.0)).xyz;',
                                '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
                                '}',
                                ].join('\n'),
            fragmentShader  : [ 'uniform vec3   glowColor;',
                                'uniform float  coeficient;',
                                'uniform float  power;',
                                'varying vec3   vVertexNormal;',
                                'varying vec3   vVertexWorldPosition;',
                                'void main(){',
                                '   vec3 worldCameraToVertex=vVertexWorldPosition - cameraPosition;',
                                '   vec3 viewCameraToVertex=(viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
                                '   viewCameraToVertex=normalize(viewCameraToVertex);',
                                '   float intensity=pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
                                '   gl_FragColor=vec4(glowColor, intensity);',
                                '}',
                            ].join('\n'),
            transparent : true,
            depthWrite  : false,
        });

        ex.render.geometry=new THREE.PLYLoader().parse(tmp);
        ex.render.geometry.sourceType = "ply";

        modifier.modify(ex.render.geometry);
        for(i=0;i<ex.render.geometry.vertices.length;i++)
        {
            ex.render.geometry.vertices[i].x*=0.14;
            ex.render.geometry.vertices[i].y*=0.14;
            ex.render.geometry.vertices[i].z*=0.14;
            ex.render.geometry.vertices[i].y+=3;
            ex.render.geometry.vertices[i].z-=2;
        }

        ex.render.brainmesh=new THREE.Mesh(ex.render.geometry,ex.render.material);
        ex.render.scene.add(ex.render.brainmesh);
        console.log("done rendering?")
    };
    oReq.send();
    this.ex = ex
    this.locations = []
    this.ex.render.spheres = new THREE.Object3D();
    this.ex.render.scene.add(this.ex.render.spheres);
    this.render_canvas = render_canvas
    //this.renderer = renderer
    /*this.renderer = new THREE.WebGLRenderer({
                        canvas: document.getElementById("3d"),
                        antialias: true, // to get smoother output
                        preserveDrawingBuffer: true, // to allow screenshot
                        alpha: true
                    });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);*/
    //this.animate()
    //return ex
}

Brain.prototype.animate = function() {
    // animation loop
    // update size, if changed
    var canvas=$(this.render_canvas)[0]//$("#3d")[0];
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height != height) {
        this.renderer.setSize ( width, height, false );
    }
    // render
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.clear(true);
    this.renderer.enableScissorTest(true);
    /*for (i in exp) {
        if(exp[i].render) {
            render(exp[i]);
        }
    }*/
    //console.log("this is", this)
    this.render()
    this.renderer.enableScissorTest(false);
    
    requestAnimationFrame(this.animate.bind(this));
}

// render the scene; called by animation loop
Brain.prototype.render = function () {
    var experiment = this.ex
    var scene = experiment.render.scene;
    var camera = experiment.render.camera;
    var trackball = experiment.render.cameraControls;

    // update camera controls
    trackball.update();

    // the scene object contains the element object, which is the div in which
    // 3d data is displayed.
    var element = experiment.render.container[0];
    var rect = element.getBoundingClientRect();
    if ( rect.bottom < 0 || rect.top  > this.renderer.domElement.clientHeight ||
         rect.right  < 0 || rect.left > this.renderer.domElement.clientWidth ) {
      return;  // it's off screen
    }
    // set the viewport
    var width  = rect.right - rect.left;
    var height = rect.bottom - rect.top;
    var left   = rect.left;
    var bottom = this.renderer.domElement.clientHeight - rect.bottom;

    // compensate for window springiness
    var dy=window.pageYOffset;
    if(dy<0) {
        bottom-=dy;
    } else {
        dy=window.pageYOffset-document.body.scrollHeight+window.innerHeight;
        if(dy>0) {
            bottom-=dy;
        }
    }

    // place viewport
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    this.renderer.setViewport( left, bottom, width, height );
    this.renderer.setScissor( left, bottom, width, height );

    this.renderer.render(scene, camera);
}

Brain.prototype.addSphere = function(coord){
  if (!_.find(this.locations, coord)){

    var geometry = new THREE.SphereGeometry(1,16,16);
    var color=0xff0000;
    var sph = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: color}));

    sph.position.x=parseFloat(coord.x)*0.14;
    sph.position.y=parseFloat(coord.y)*0.14+3;
    sph.position.z=parseFloat(coord.z)*0.14-2;
    this.ex.render.spheres.add(sph);
    coord.sph = sph
    this.locations.push(coord)
    //console.log("added sphere")
  }
  else{
    console.log("sphere already exists")
  }

}

Brain.prototype.removeSphere = function(coord){
  var row = _.find(this.locations, coord)
  _.remove(this.locations, row)
  this.ex.render.spheres.remove(row.sph);
}

Brain.prototype.clearSpheres =function(){

  for (var i = this.ex.render.spheres.children.length - 1; i >= 0; i--) {
      this.ex.render.spheres.remove(this.ex.render.spheres.children[i]);
  }

  this.locations = []

}

Brain.prototype.updateSpheres = function(){
  var self = this
  var tmp_locations = this.locations
  self.clearSpheres(false)

  _.map(tmp_locations, function(loc){
    self.addSphere(loc)
  })

}



Brain.prototype.mouseDown = function(callback){

  this.ex.render.container.on("mousedown",  mouseDownHandler(this, callback))
}

// handle clicking on location spheres
function mouseDownHandler(brain_object, callback){
  return function(event) {

      event.preventDefault();
      var r = event.target.getBoundingClientRect();

      mouseVector = new THREE.Vector3();
      mouseVector.x= ((event.clientX-r.left) / event.target.clientWidth ) * 2 - 1;
      mouseVector.y=-((event.clientY-r.top) / event.target.clientHeight ) * 2 + 1;

      var raycaster=new THREE.Raycaster();
      raycaster.setFromCamera(mouseVector.clone(), brain_object.ex.render.camera);
      var intersects = raycaster.intersectObjects( brain_object.ex.render.spheres.children );

      if(intersects.length==0)
          //brain_object.clear_highlight()
          //callback()
          return;
      brain_object.ex.render.spheres.children.forEach(function(sph) { sph.material.color.setRGB( 1,0,0 );});
      intersects[0].object.material.color.setRGB(0,1,0);
      var uuid = intersects[0].object.uuid
      var location = _.filter(brain_object.locations, function(x){
        return x.sph.uuid == uuid ? true : false
      })
      console.log("intersects", intersects[0])
      callback(intersects[0], location[0])
  }

}
Brain.prototype.highlight_sphere = function(coord) {

    this.ex.render.spheres.children.forEach(function( sph ) { sph.material.color.setRGB( 1,0,0 );});

    var loc = _.find(this.locations, coord)
    if (loc){
      loc.sph.material.color.setRGB(0,1,0);
    }
}

Brain.prototype.clear_highlight = function() {
    this.ex.render.spheres.children.forEach(function( sph ) { sph.material.color.setRGB( 1,0,0 );});
}
