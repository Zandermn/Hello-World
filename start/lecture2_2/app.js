import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
		
		//PerspectiveCamera
        this.camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight, 0.1, 100);
		this.camera.position.set(0,0,4);

		//Scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0xaaaaaa);
		
		//Ambient Light
		const ambient = new THREE.HemisphereLight(0xffffff,0xbbbbff,0.3);
		this.scene.add(ambient);
		
		//DirectionalLight
		const light = new THREE.DirectionalLight();
		light.position.set(0.2, 1, 1);
		this.scene.add(light);

		//Renderer
		this.renderer = new THREE.WebGLRenderer({antialias:true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);

		this.renderer.setAnimationLoop(this.render.bind(this));

		//Geometry and the material
		const geometry = new THREE.BoxBufferGeometry();
		const material = new THREE.MeshStandardMaterial({color:0xff0000});
		this.mesh = new THREE.Mesh(geometry, material);
		this.scene.add(this.mesh);

		const controls = new OrbitControls(this.camera, this.renderer.domElement);

        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    resize(){
        this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
	render( ) {  
		this.mesh.rotateY(0.01);
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };