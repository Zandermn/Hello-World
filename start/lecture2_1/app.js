import * as THREE from '../../libs/three/three.module.js';
import { OrbitControls } from '../../libs/three/jsm/OrbitControls.js';

class App{
	//constructor method is called when new instance is created,
	//it can take any number of parameter
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
    
		//"this" inside constructor refers to an instance of the App class
		//If there is no bind after this.resize, 
		//the resize() function will be a window object instead a App instance object

        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    resize(){
        console.log(window);
    }
    
	render() {   
        
    }
}

export { App };