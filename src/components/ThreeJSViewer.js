import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeJSViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.doorGroup = null;
        this.materials = {};
        
        this.init();
        this.setupMaterials();
    }
    
    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            85,
            this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight,
            0.01,
            5000
        );
        this.camera.position.set(600, 500, 2500);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        // Create reusable resize method
        this.updateRendererSize = () => {
            const container = this.canvas.parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;

            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.render(this.scene, this.camera);
        };

        // Call it immediately
        this.updateRendererSize();

        // Add resize listener
        window.addEventListener('resize', () => {
            this.updateRendererSize();
        });

        // Keep existing renderer configuration
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 300;
        this.controls.maxDistance = 1500;
        this.controls.maxPolarAngle = Math.PI / 2;

        // Lighting
        this.setupLighting();
        
        // Start render loop
        this.animate();
    }
    
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(200, 200, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);
        
        // Fill light from the left
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-100, 50, 50);
        this.scene.add(fillLight);
        
        // Rim light from behind
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 100, -200);
        this.scene.add(rimLight);
    }
    
    addGroundPlane() {
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f0f0,
            transparent: true,
            opacity: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -50;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }
    
    setupMaterials() {
        // Wood materials
        this.materials.wood = {
            oak: new THREE.MeshStandardMaterial({ 
                color: 0x8B6914,
                roughness: 0.8,
                metalness: 0.05,
                normalScale: new THREE.Vector2(0.5, 0.5)
            }),
            pine: new THREE.MeshStandardMaterial({ 
                color: 0xDEB887,
                roughness: 0.7,
                metalness: 0.05
            }),
            mahogany: new THREE.MeshStandardMaterial({ 
                color: 0x7C4A3A,
                roughness: 0.6,
                metalness: 0.1
            }),
            walnut: new THREE.MeshStandardMaterial({ 
                color: 0x5D4037,
                roughness: 0.7,
                metalness: 0.1
            })
        };
        
        // Finish materials (modify base wood materials)
        this.materials.painted = {
            white: new THREE.MeshStandardMaterial({ 
                color: 0xF8F8FF,
                roughness: 0.4,
                metalness: 0.05
            }),
            cream: new THREE.MeshStandardMaterial({ 
                color: 0xFFFDD0,
                roughness: 0.4,
                metalness: 0.05
            }),
            grey: new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.4,
                metalness: 0.05
            }),
            black: new THREE.MeshStandardMaterial({ 
                color: 0x2C2C2C,
                roughness: 0.3,
                metalness: 0.1
            })
        };
        
        // Glass materials
        this.materials.glass = {
            clear: new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.05,
                roughness: 0,
                metalness: 0,
                transmission: 0.95,
                thickness: 2,
                ior: 1.5,
                reflectivity: 0.1
            }),
            frosted: new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                roughness: 1,
                metalness: 0,
                transmission: 0.7,
                thickness: 2
            }),
            decorative: new THREE.MeshPhysicalMaterial({
                color: 0xe8f4f8,
                transparent: true,
                opacity: 0.2,
                roughness: 0.8,
                metalness: 0,
                transmission: 0.8,
                thickness: 2
            })
        };
        
        // Hardware materials
        this.materials.hardware = {
            brass: new THREE.MeshStandardMaterial({ 
                color: 0xB8860B,
                roughness: 0.2,
                metalness: 0.9
            }),
            chrome: new THREE.MeshStandardMaterial({ 
                color: 0xC0C0C0,
                roughness: 0.1,
                metalness: 0.95
            }),
            black: new THREE.MeshStandardMaterial({ 
                color: 0x2C2C2C,
                roughness: 0.3,
                metalness: 0.8
            })
        };
        
        // Frame material
        this.materials.frame = new THREE.MeshStandardMaterial({ 
            color: 0x8B7355,
            roughness: 0.8,
            metalness: 0.05
        });
    }
    
    createDoor(config) {
        // Remove existing door
        if (this.doorGroup) {
            this.scene.remove(this.doorGroup);
        }
        
        this.doorGroup = new THREE.Group();
        
        // Create main door components
        const doorPanel = this.createDoorPanel(config);
        const doorFrame = this.createDoorFrame(config);
        
        this.doorGroup.add(doorPanel);
        this.doorGroup.add(doorFrame);
        
        // Add glass if configured - with proper validation
        if (config.hasGlass && config.glassWidth && config.glassHeight && config.glassWidth > 0 && config.glassHeight > 0) {
            console.log('Creating glass panel:', { width: config.glassWidth, height: config.glassHeight, type: config.glassType });
            const glassPanel = this.createGlassPanel(config);
            this.doorGroup.add(glassPanel);
        }
        
        // Add hardware
        const hardware = this.createHardware(config);
        this.doorGroup.add(hardware);
        
        // Add door style details
        this.addDoorStyleDetails(config);
        
        // Center the door
        const box = new THREE.Box3().setFromObject(this.doorGroup);
        const center = box.getCenter(new THREE.Vector3());
        this.doorGroup.position.sub(center);
        this.doorGroup.position.y = 0; 
        
        this.scene.add(this.doorGroup);
        
        // Force immediate render after door creation
        requestAnimationFrame(() => {
            this.updateRendererSize();
        });
    }
    
    createDoorPanel(config) {
        const width = config.width || 838;
        const height = config.height || 1981;
        const thickness = config.thickness || 44;
        
        // Main door geometry
        const doorGeometry = new THREE.BoxGeometry(width, height, thickness);
        
        // Get material based on configuration
        const doorMaterial = this.getDoorMaterial(config);
        
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.castShadow = true;
        doorMesh.receiveShadow = true;
        
        return doorMesh;
    }
    
    createDoorFrame(config) {
        const frameGroup = new THREE.Group();
        const frameWidth = 60;
        const frameDepth = 30;
        const width = config.width || 838;
        const height = config.height || 1981;
        
        // Left frame
        const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, height + frameWidth * 2, frameDepth);
        const leftFrame = new THREE.Mesh(leftFrameGeometry, this.materials.frame);
        leftFrame.position.set(-width/2 - frameWidth/2, frameWidth/2, -frameDepth/2);
        leftFrame.castShadow = true;
        frameGroup.add(leftFrame);
        
        // Right frame
        const rightFrame = new THREE.Mesh(leftFrameGeometry, this.materials.frame);
        rightFrame.position.set(width/2 + frameWidth/2, frameWidth/2, -frameDepth/2);
        rightFrame.castShadow = true;
        frameGroup.add(rightFrame);
        
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(width + frameWidth * 2, frameWidth, frameDepth);
        const topFrame = new THREE.Mesh(topFrameGeometry, this.materials.frame);
        topFrame.position.set(0, height/2 + frameWidth/2, -frameDepth/2);
        topFrame.castShadow = true;
        frameGroup.add(topFrame);
        
        // Bottom frame (sill)
        const bottomFrame = new THREE.Mesh(topFrameGeometry, this.materials.frame);
        bottomFrame.position.set(0, -height/2 - frameWidth/2, -frameDepth/2);
        bottomFrame.castShadow = true;
        frameGroup.add(bottomFrame);
        
        return frameGroup;
    }
    
    createGlassPanel(config) {
        const glassWidth = config.glassWidth;
        const glassHeight = config.glassHeight;
        const thickness = 6;
        
        // Calculate centered position with minimum edge distance
        const glassX = config.glassX || 0;
        const glassY = config.glassY || 0;
        
        const glassGeometry = new THREE.BoxGeometry(glassWidth, glassHeight, thickness);
        const glassMaterial = this.getGlassMaterial(config.glassType || 'clear');
        
        const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        glassMesh.position.set(glassX, glassY, config.thickness/2 + thickness/2 + 1);
        glassMesh.castShadow = true;
        glassMesh.receiveShadow = true;
        
        // Add glass frame/beading
        const frameGroup = this.createGlassFrame(glassWidth, glassHeight, config);
        frameGroup.position.copy(glassMesh.position);
        
        const glassGroup = new THREE.Group();
        glassGroup.add(glassMesh);
        glassGroup.add(frameGroup);
        
        return glassGroup;
    }
    
    createGlassFrame(glassWidth, glassHeight, config) {
        const frameGroup = new THREE.Group();
        const beadWidth = 8;
        const beadThickness = 6;
        const beadMaterial = this.getDoorMaterial(config);
        
        // Top bead
        const topBeadGeometry = new THREE.BoxGeometry(glassWidth + beadWidth * 2, beadWidth, beadThickness);
        const topBead = new THREE.Mesh(topBeadGeometry, beadMaterial);
        topBead.position.set(0, glassHeight/2 + beadWidth/2, beadThickness/2);
        frameGroup.add(topBead);
        
        // Bottom bead
        const bottomBead = new THREE.Mesh(topBeadGeometry, beadMaterial);
        bottomBead.position.set(0, -glassHeight/2 - beadWidth/2, beadThickness/2);
        frameGroup.add(bottomBead);
        
        // Left bead
        const sideBeadGeometry = new THREE.BoxGeometry(beadWidth, glassHeight, beadThickness);
        const leftBead = new THREE.Mesh(sideBeadGeometry, beadMaterial);
        leftBead.position.set(-glassWidth/2 - beadWidth/2, 0, beadThickness/2);
        frameGroup.add(leftBead);
        
        // Right bead
        const rightBead = new THREE.Mesh(sideBeadGeometry, beadMaterial);
        rightBead.position.set(glassWidth/2 + beadWidth/2, 0, beadThickness/2);
        frameGroup.add(rightBead);
        
        return frameGroup;
    }
    
    createHardware(config) {
        const hardwareGroup = new THREE.Group();
        const width = config.width || 838;
        const thickness = config.thickness || 44;
        
        // Door handle
        const handleMaterial = this.getHardwareMaterial(config.hardware);
        
        // Handle lever
        const leverGeometry = new THREE.CylinderGeometry(6, 6, 120, 8);
        const lever = new THREE.Mesh(leverGeometry, handleMaterial);
        lever.rotation.z = Math.PI / 2;
        lever.position.set(width/2 - 100, 0, thickness/2 + 20);
        lever.castShadow = true;
        hardwareGroup.add(lever);
        
        // Handle backplate
        const backplateGeometry = new THREE.CylinderGeometry(25, 25, 8, 16);
        const backplate = new THREE.Mesh(backplateGeometry, handleMaterial);
        backplate.rotation.x = Math.PI / 2;
        backplate.position.set(width/2 - 100, 0, thickness/2 + 4);
        backplate.castShadow = true;
        hardwareGroup.add(backplate);
        
        // Keyhole
        const keyholeGeometry = new THREE.CylinderGeometry(3, 3, 8, 8);
        const keyhole = new THREE.Mesh(keyholeGeometry, this.materials.hardware.black);
        keyhole.rotation.x = Math.PI / 2;
        keyhole.position.set(width/2 - 100, -15, thickness/2 + 8);
        hardwareGroup.add(keyhole);
        
        // Hinges
        this.createHinges(hardwareGroup, config);
        
        return hardwareGroup;
    }
    
    createHinges(hardwareGroup, config) {
        const width = config.width || 838;
        const height = config.height || 1981;
        const thickness = config.thickness || 44;
        
        const hingeMaterial = this.getHardwareMaterial(config.hardware);
        const hingePositions = [height/2 - 150, 0, -height/2 + 150]; // Top, middle, bottom
        
        hingePositions.forEach(y => {
            // Hinge leaf on door
            const leafGeometry = new THREE.BoxGeometry(8, 80, 60);
            const doorLeaf = new THREE.Mesh(leafGeometry, hingeMaterial);
            doorLeaf.position.set(-width/2 - 4, y, 0);
            doorLeaf.castShadow = true;
            hardwareGroup.add(doorLeaf);
            
            // Hinge pin
            const pinGeometry = new THREE.CylinderGeometry(4, 4, 80, 8);
            const pin = new THREE.Mesh(pinGeometry, hingeMaterial);
            pin.position.set(-width/2 - 8, y, 0);
            pin.castShadow = true;
            hardwareGroup.add(pin);
        });
    }
    
    addDoorStyleDetails(config) {
        // Add visual details based on door type
        // This could include panels, grooves, decorative elements
        // Implementation would depend on specific door styles
    }
    
    getDoorMaterial(config) {
        if (config.finish === 'painted') {
            const color = config.paintColor || 'white';
            return this.materials.painted[color] || this.materials.painted.white;
        } else {
            const material = config.material || 'oak';
            return this.materials.wood[material] || this.materials.wood.oak;
        }
    }
    
    getGlassMaterial(glassType) {
        return this.materials.glass[glassType] || this.materials.glass.clear;
    }
    
    getHardwareMaterial(hardwareType) {
        if (hardwareType && hardwareType.includes('brass')) {
            return this.materials.hardware.brass;
        } else if (hardwareType && hardwareType.includes('black')) {
            return this.materials.hardware.black;
        } else {
            return this.materials.hardware.chrome;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.updateRendererSize();
    }
    
    resetView() {
        this.camera.position.set(600, 500, 2500);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
}
