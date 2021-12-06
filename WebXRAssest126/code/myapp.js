import * as THREE from '../build/three.module.js';
import Stats from '../examples/jsm/libs/stats.module.js';
import { VRButton } from '../examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from '../examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../examples/jsm/loaders/OBJLoader.js';
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
		this.scene.background = new THREE.Color(0xaaaaaa);

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
		
        this.initScene();
        this.setupVR();
        window.addEventListener('resize', this.resize.bind(this) );
    }

    initScene(){
		const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3);
		this.scene.add(ambient);
		
		const light = new THREE.DirectionalLight();
		light.position.set(0.2, 1, 1);
		this.scene.add(light);

        //Redcube
		const geometry = new THREE.BoxBufferGeometry();
		const material = new THREE.MeshStandardMaterial({color:0xff0000});
		this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0,2,-2);
		this.scene.add(this.mesh);



        //Cube line
        this.room = new THREE.LineSegments(
            new THREE.BoxGeometry(8,8,8,8,8,8),
            new THREE.LineBasicMaterial({color:0xffffff})
        );
        this.room.geometry.translate(0,3,0);
        this.scene.add(this.room);

        //random ico
        this.radius = 0.08;
        const geometryIco = new THREE.IcosahedronBufferGeometry( this.radius, 2 );
        for ( let i = 0; i < 200; i ++ ) {
            const object = new THREE.Mesh( geometryIco, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
            object.position.x = this.random( -2, 2 );
            object.position.y = this.random( -2, 2 );
            object.position.z = this.random( -2, 2 );
            this.room.add( object );
        }



        //blueline
        const materialLine = new THREE.LineBasicMaterial({color: 0x0000ff});
        const points = [];
        points.push( new THREE.Vector3( - 10, 0, 0 ) );
        points.push( new THREE.Vector3( 0, 10, 0 ) );
        points.push( new THREE.Vector3( 10, 0, 0 ) );
        const geometryLine = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line( geometryLine, materialLine );
        this.scene.add( line );

    }

    random( min, max ){
        return Math.random() * (max-min) + min;
    }

    setupVR(){
        //Create VRButton and create VRSession
        this.renderer.xr.enabled = true;
        document.body.appendChild( VRButton.createButton( this.renderer ) );

        //Create controllers
        this.controllers = this.buildControllers();
    }

    buildControllers(){
        const controllerModelFactory = new XRControllerModelFactory();
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0,-1)
        ]);
        const line = new THREE.Line(geometry);
        line.name = 'controllerLine';
        line.scale.z = 0;

        const controllers = [];
        for(let i = 0; i <= 1; i++){
            const controller = this.renderer.xr.getController(i);
            controller.add(line.clone());
            controller.userData.selectPressed = false;
            this.scene.add(controller);

            controllers.puch(controller);

            const grip = this.renderer.xr.getControllerGrip(i);
            grip.add(controllerModelFactor.createControllerModel(grip));
            this.scene.add(grip);
        }

        return controllers;
    }

    resize(){
        this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {  
		this.mesh.rotateY(0.01);
        this.stats.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { MyApp };

