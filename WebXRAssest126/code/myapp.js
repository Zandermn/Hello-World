import * as THREE from '../build/three.module.js';
import Stats from '../examples/jsm/libs/stats.module.js';
import { VRButton } from '../examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from '../examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../examples/jsm/loaders/OBJLoader.js';
import { BoxLineGeometry } from '../examples/jsm/geometries/BoxLineGeometry.js'
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { XRControllerModelFactory } from '../../libs/three/jsm/XRControllerModelFactory.js';

class MyApp{
    constructor(){
        const container = document.createElement( 'div' );
        document.body.appendChild( container );

        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.05, 100);
		this.camera.position.set(0,1.6,3);
        this.camera.lookAt(0,40,0);

        this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x000000);

		this.renderer = new THREE.WebGLRenderer({antialias:true, powerPerference: "high-performance" });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setAnimationLoop(this.render.bind(this));
		container.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.6, 0);
        this.controls.autoRotate = true;
        this.controls.update();

        this.stats = new Stats();
        container.appendChild( this.stats.dom );

        this.raycaster = new THREE.Raycaster();
        this.workingMatrix = new THREE.Matrix4();
        this.workingVector = new THREE.Vector3();
		
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
        this.renderer.setAnimationLoop( this.render.bind(this) );
    }

    initScene(){
        //lights
		const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3);
        ambient.position.set(0, 10, 0);
		this.scene.add(ambient);
		
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.castShadow = true;
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(- 1, 1.75, 1);
        dirLight.position.multiplyScalar(8);
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        const d = 20;
        dirLight.shadow.camera.left = - d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = - d;
        dirLight.shadow.camera.far = 1000;
        dirLight.shadow.bias = - 0.0001;
        this.scene.add(dirLight);

        //Redcube
		const geometry = new THREE.BoxBufferGeometry();
		const material = new THREE.MeshStandardMaterial({color:0xff0000});
		this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0,3,-3);
		this.scene.add(this.mesh);

        //Cube line
        this.room = new THREE.LineSegments(
            new BoxLineGeometry(30,8,30,6,6,6),
            new THREE.LineBasicMaterial({color:0xffffff})
        );
        this.room.geometry.translate(0,3.95,0);
        this.scene.add(this.room);

        //randomFormRange ico
        this.radius = 0.08;
        const geometryIco = new THREE.IcosahedronBufferGeometry( this.radius, 2 );
        for ( let i = 0; i < 400; i ++ ) {
            const object = new THREE.Mesh( geometryIco, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
            object.position.x = this.randomFormRange( -15, 15 );
            object.position.y = this.randomFormRange( 3, 8 );
            object.position.z = this.randomFormRange( -15, 15 );
            this.room.add( object );
        }

        //blueline
        // const materialLine = new THREE.LineBasicMaterial({color: 0x0000ff});
        // const points = [];
        // points.push( new THREE.Vector3( - 10, 0, 0 ) );
        // points.push( new THREE.Vector3( 0, 10, 0 ) );
        // points.push( new THREE.Vector3( 10, 0, 0 ) );
        // const geometryLine = new THREE.BufferGeometry().setFromPoints( points );
        // const line = new THREE.Line( geometryLine, materialLine );
        // this.scene.add( line );

        //highlight white mesh
        this.highlight = new THREE.Mesh(geometryIco, new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.BackSide}));
        this.highlight.scale.set(1.2, 1.2, 1.2);
        this.scene.add(this.highlight);

        //Ground
        const TileG = 4;
        const distance = 10;
        const offsetX = -10;
        const offsetY = -20;
        for(let i = 0; i < TileG; i++){
            for(let j = 0; j < TileG; j++){
                this.CreateGround(i * distance + offsetX, 0, j * distance + offsetY);
            }
        }

        this.CreateBarrel(0,0,-1);
        this.CreateBarrel(0.7,0,-0.8);
        this.CreateBarrel(6,0,-3.3);
        this.CreateBarrel(7,0,-4.1);

        this.CreateBox(5.3,0,-4.5);

        this.CreateLamp(-5,0,-5);
        this.CreateLamp(-5,0,5);
        this.CreateLamp(5,0,-5);
        this.CreateLamp(5,0,5);
    }

    

    randomFormRange( min, max ){
        return Math.random() * (max-min) + min;
    }

    setupVR(){
        //Create VRButton and create VRSession
        this.renderer.xr.enabled = true;
        document.body.appendChild( VRButton.createButton( this.renderer ) );

        //for callback function
        const self = this;

        //Create controllers
        this.controllers = this.buildControllers();

        //onselect start and end
        function onSelectStart(){
            this.children[0].scale.z = 10;
            this.userData.selectPressed = true;
        }

        function onSelectEnd(){
            this.children[0].scale.z = 0;
            self.highlight.visible = false;
            this.userData.selectPressed = false;
        }

        this.controllers.forEach( (controller) => {
            controller.addEventListener( 'selectstart', onSelectStart );
            controller.addEventListener( 'selectend', onSelectEnd );
        });
    }

    //A virtual pairs of controlelrs
    buildControllers(){
        const controllerModelFactory = new XRControllerModelFactory();
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,-1)
        ]);
        const line = new THREE.Line(geometry);
        line.name = 'line';
        line.scale.z = 10;

        const controllers = [];

        for(let i = 0; i <= 1; i++){
            const controller = this.renderer.xr.getController(i);
            controller.add(line.clone());
            controller.userData.selectPressed = false;
            this.scene.add(controller);

            controllers.push(controller);

            const grip = this.renderer.xr.getControllerGrip(i);
            grip.add(controllerModelFactory.createControllerModel(grip));
            this.scene.add(grip);
        }

        return controllers;
    }

    handleController( controller ){
        if (controller.userData.selectPressed ){
            controller.children[0].scale.z = 10;

            this.workingMatrix.identity().extractRotation( controller.matrixWorld );

            this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
            this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.workingMatrix );

            const intersects = this.raycaster.intersectObjects( this.room.children );

            if (intersects.length>0){
                intersects[0].object.add(this.highlight);
                this.highlight.visible = true;
                controller.children[0].scale.z = intersects[0].distance;
            }else{
                this.highlight.visible = false;
            }
        }
    }

    resize(){
		this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
        console.log("Resized");
    }

    render() {  
		this.mesh.rotateY(0.01);
        this.stats.update();

        if (this.controllers ){
            const self = this;
            this.controllers.forEach( ( controller) => { 
                self.handleController( controller ) 
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    CreateBarrel(x,y,z)
    {
        const self = this;
        const loaderB = new GLTFLoader();
        loaderB.load(
            '../../WebXRAssest/model/Barrel.glb',
            function (gltf) {
                const model = gltf.scene;
                model.position.set(x,y,z);

                gltf.scene.traverse(
                    function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    }
                );
                self.scene.add(gltf.scene);
            }, 
            undefined, 
            function (error) {
                console.error("Barrel had some problem");
            }
        );
    }

    CreateBox(x,y,z)
    {
        const self = this;
        const loaderBox = new GLTFLoader();
        loaderBox.load(
            '../../WebXRAssest/model/Boxes.glb',
            function (gltf) {
                const model = gltf.scene;
                model.position.set(x,y,z);

                gltf.scene.traverse(
                    function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    }
                );
                self.scene.add(gltf.scene);
            }, 
            undefined, 
            function (error) {
                console.error("Boxes had some problem");
            }
        );
    }

    CreateGround(x,y,z)
    {
        const self = this;
        const loaderGround = new GLTFLoader();
        loaderGround.load(
            '../../WebXRAssest126/model/PlaneLowT.glb',
            function(gltf){
                const model = gltf.scene;
                model.position.set(x,y,z);

                gltf.scene.traverse(
                    function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    }
                );
                self.scene.add(gltf.scene);
            },
            undefined, 
            function (error) {
                console.error("Ground had some problem");
            }
        );

    }

    CreateLamp(x,y,z)
    {
        const self = this;

        const spotlightx = x - 1.7;
        const spotlighty = y + 3.5;
        const spotlightz = z;

        //Lamp
        const loader1024 = new GLTFLoader();
        loader1024.load(
            '../../WebXRAssest/model/lamp1024.glb',
            function (gltf) {
                const model = gltf.scene;
                model.scale.set(0.1, 0.1, 0.1);
                model.position.set(x,y,z);

                gltf.scene.traverse(
                    function (node) {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    }
                );
                self.scene.add(gltf.scene);

            }, undefined, function (error) {
                console.error("Lamp had some problem");
            }
        );

        const spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( spotlightx, spotlighty, spotlightz );
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 500;
        spotLight.shadow.camera.fov = 30;
        spotLight.penumbra = 0.5;
        spotLight.intensity = 2;
        spotLight.distance = 50;

        const targetObject = new THREE.Object3D();
        targetObject.position.set(spotlightx, spotlighty - 1, spotlightz);
        self.scene.add(targetObject);

        spotLight.target = targetObject;
        self.scene.add( spotLight );

    }
}

export { MyApp };

