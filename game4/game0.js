
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/


	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, edgeCam;  // we have two cameras in the main scene
	var avatar;
	// here are some mesh objects ...

	var cone;
	var npc;
	var startScene, startCamera;
	var endScene, endCamera, endText;

	var lScene, lcamera;
	var textMesh;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'start', camera:'none' }


	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!


	function createStartScene(){
			startScene=initScene();
			var floor =createGround('startscreen.jpg',1);
			floor.rotateX(Math.PI);
			//floor.rotateY(Math.PI);
			startScene.add(floor);
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			startScene.add(light1);
			startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			startCamera.position.set(0,50,1);
			startCamera.lookAt(0,0,0);
		}


	function createEndScene(){
			endScene = initScene();
		  endText = createSkyBox('youwon.png',10);
  	//endText.rotateX(Math.PI);
		endScene.add(endText)
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);

	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = initScene();
			createStartScene();
			createEndScene();
			initRenderer();
			createMainScene();
			initTextMesh();
	}


	function createMainScene(){
      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);


			// create the ground and the skybox
			var ground = createGround('grass.png',15);
			scene.add(ground);
			var skybox = createSkyBox('smile.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			avatar = createAvatar();
			initSuzanne();
			initSuzanne2();
			avatar.translateY(20);
			avatarCam.translateY(-4);
			avatarCam.translateZ(3);
			scene.add(avatar);
			gameState.camera = avatarCam;

      edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
      edgeCam.position.set(20,20,10);


			addBalls();

			cone = createConeMesh(4,6);
			cone.position.set(10,3,7);
			scene.add(cone);

			npc = createBoxMesh2(0x0000ff,1,2,4);
			npc.position.set(30,5,-30);
      npc.addEventListener('collision',function(other_object){
        if (other_object==avatar){
          gameState.health--;
					npc.__dirtyPosition = true;
					npc.position.set(randN(50),5,randN(50));
					if (gameState.health==0) {
						gameState.scene='youlost';
					}
        }
      })
			scene.add(npc);
        //npc.position.distanceTo(avatar.position) npc和avater距离
      var wall = createWall(0xffaa00,50,3,1);
      wall.position.set(10,0,10);
      scene.add(wall);
			//console.dir(npc);
			playGameMusic();

			function initTextMesh(){
				var loader = new THREE.FontLoader();
				loader.load( '/fonts/helvetiker_regular.typeface.json',
										 createTextMesh);
				console.log("preparing to load the font");

			}

			function createTextMesh(font) {
				var textGeometry =
					new THREE.TextGeometry( 'Welcome Hun',
							{
								font: font,
								size: 1,
								height: 0.2,
								curveSegments: 12,
								bevelEnabled: true,
								bevelThickness: 0.01,
								bevelSize: 0.08,
								bevelSegments: 5
							}
						);

				var textMaterial =
					new THREE.MeshLambertMaterial( { color: 0xaaaaff } );

				textMesh =
					new THREE.Mesh( textGeometry, textMaterial );

				// center the text mesh
				textMesh.translateX(5);
				textMesh.translateY(6);
				textMesh.translateZ(6);


				scene.add(textMesh);

				console.log("added textMesh to scene");
			}
	}



	function distance(o1, o2) {
		var dx = o1.position.x - o2.position.x;
		var dy = o1.position.y - o2.position.y;
		var dz = o1.position.z - o2.position.z;
		return Math.sqrt(dx*dx + dy*dy + dz*dz);
	}

	function randN(n){
		return Math.random()*n;
	}




	function addBalls(){
		var numBalls = 20;

		var redBall = createBonusBall();
		redBall.position.set(randN(20)+15,30,randN(20)+15);
		scene.add(redBall);
		redBall.addEventListener('collision',
			function(other_object,relative_velocity, relative_rotation, contact_normal) {
				if(other_object == avatar){
					gameState.health += 2;
				}
			}
		)

		for(i=0;i<numBalls;i++){
			var ball = createBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
            //scene.remove(ball);  // this isn't working ...
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
          else if (other_object == cone){
            gameState.health ++;
          }
				}
			)
		}
	}



	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/bg.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){

		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs(){
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}

	function initTextMesh(){
		var loader = new THREE.FontLoader();
		loader.load( '/fonts/helvetiker_regular.typeface.json',
								 createTextMesh);
		console.log("preparing to load the font");

	}

	function createTextMesh(font) {
		var textGeometry =
			new THREE.TextGeometry( 'Welcome Hun',
					{
						font: font,
						size: 1,
						height: 0.2,
						curveSegments: 12,
						bevelEnabled: true,
						bevelThickness: 0.01,
						bevelSize: 0.08,
						bevelSegments: 5
					}
				);

		var textMaterial =
			new THREE.MeshLambertMaterial( { color: 0xaaaaff } );

		textMesh =
			new THREE.Mesh( textGeometry, textMaterial );

		// center the text mesh
		textMesh.translateX(5);
		textMesh.translateY(6);
		textMesh.translateZ(6);

		scene.add(textMesh);

		console.log("added textMesh to scene");
	}

	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}



	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createBoxMesh2(color,w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		material.visible = false;
		mesh = new Physijs.BoxMesh( geometry, material );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

  function createWall(color,w,h,d){
    var geometry = new THREE.BoxGeometry( w, h, d);
    var material = new THREE.MeshLambertMaterial( { color: color} );
    mesh = new Physijs.BoxMesh( geometry, material, 0 );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
    mesh.castShadow = true;
    return mesh;
  }



	function createGround(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}



	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}

	function createAvatar(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.BoxGeometry( 5, 5, 6);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		pmaterial.visible = false;
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;

		avatarCam.position.set(0,4,0);
		avatarCam.lookAt(0,4,10);
		mesh.add(avatarCam);

  /*
    var scoop1 = createBoxMesh2(0xff0000,10,1,0.1);
		scoop1.position.set(0,-2,5);
		mesh.add(scoop1);
    */

		return mesh;
	}


	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	//add a red ball that increase avatar health by 2 when contacted
	function createBonusBall(){
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: "red"} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
		var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown: '"+event.key+"'");
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if(gameState.scene =='start' && event.key == 'p'){
			gameState.scene='main';
			gameState.score=0;
			addBalls();
			return;
		}

		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}

		if (gameState.scene == 'youlost' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			gameState.health = 10;
			addBalls();
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "t": controls.tele = true; break;
			case "q": controls.camLeft = true; break;
			case "e": controls.camRight = true; break;
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": controls.up = true; break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
      case " ": controls.fly = true;
          console.log("space!!");
          break;
      case "h": controls.reset = true; break;




			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
      case "3": gameState.camera = edgeCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;

// case "r": avater dirtyposition (0,0,0)
		}

	}

	function keyup(event){
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key){
			case "t": controls.tele = false; break;
			case "q": controls.camLeft = false; break;
			case "e": controls.camRight = false; break;
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
      case " ": controls.fly = false; break;
      case "h": controls.reset = false; break;

		}
	}

	function updateNPC(){
		npc.lookAt(avatar.position);
		if (distance(npc, avatar) < 20.0) {
			npc.__dirtyPosition = true;
			//npc.setLinearVelocity(2);
			npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(100));
		}
		//npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(-0.5));
	}

  function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

		if (controls.camLeft) {
			avatarCam.rotateY(0.1);
		} else if (controls.camRight) {
			avatarCam.rotateY(-0.1);
		}
		//teleport to the other side
		if (controls.tele) {
			avatar.__dirtyPosition = true;
			avatar.position.set(0, 10, 30);
		}

    if (controls.reset){
      avatar.__dirtyPosition = true;
      avatar.position.set(40,10,40);
    }

	}



	function animate() {

		requestAnimationFrame( animate );
		// console.log(gameState.scene);

		switch(gameState.scene) {

			case "start":
				renderer.render(startScene,startCamera);
				break;

			case "youwon":
				//endText.rotateY(0.005)
				renderer.render( endScene, endCamera );
				break;

			case "youlost":

			lScene=initScene();
			var floor =createGround('youlost.jpg',1);
			floor.rotateX(Math.PI);
			//floor.rotateY(Math.PI);
			lScene.add(floor);

				var light1 = createPointLight();
				light1.position.set(0,200,20);
				lScene.add(light1);
				const lcamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
				lcamera.position.set(0,50,1);
				lcamera.lookAt(0,0,0);
				renderer.render( lScene, lcamera );
				break;

			case "main":
				updateAvatar();
				updateNPC();
        edgeCam.lookAt(avatar.position);
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				if (textMesh){
					textMesh.translateX(4);
					textMesh.rotateY(-0.01);
					textMesh.translateX(-4);
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);

		}

		//draw heads up display ..
	  var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
    + gameState.score
    + " health="+gameState.health
    + '</div>';

	}

	function initSuzanne(){
 	var json_loader = new THREE.JSONLoader();
 	json_loader.load( "../models/suzanne.json", function( suzanne, suzanne_materials ) {
 		var mesh = new THREE.Mesh(
 			suzanne,
 			// new THREE.MeshFaceMaterial( suzanne_materials )
 			new THREE.MeshLambertMaterial( { color: 0x00ff00 } )
 		);
 		mesh.castShadow = true;
 		avatar.add(mesh);
 	});
 }

 function initSuzanne2(){
 var json_loader = new THREE.JSONLoader();
 json_loader.load( "../models/suzanne.json", function( suzanne, suzanne_materials ) {
	 var mesh = new THREE.Mesh(
		 suzanne,
		 // new THREE.MeshFaceMaterial( suzanne_materials )
		 new THREE.MeshLambertMaterial( { color: 0x0000ff } )
	 );
	 mesh.castShadow = true;
	 npc.add(mesh);
 });
}
