import { mat4, quat, vec3 } from "gl-matrix";
import { Camera } from "./camera";
import { BaseMesh, CircularPlane, Cube, Cylinder, Hemisphere, Rect, Sphere } from "./mesh";
import { Shader } from "./shader";
import { MeshTree, Model } from "./model";


const canvas: HTMLCanvasElement = document.querySelector("#glcanvas");
export const gl: WebGLRenderingContext = canvas.getContext("webgl");

if (gl == null) {
    alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
    )
}

interface MouseEvent {
    transX: number;
    drag: boolean,
    transY: number,
    transZ: number,
    rotX: number,
    rotY: number,
    rotZ: number,
    offX: number,
    offY: number,
    offZ: number
}


export class Scene {

    public canvas: HTMLCanvasElement;
    public vsTexSource: string = `
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;
        attribute vec3 aVertexNormal;

        uniform mat3 uNMatrix;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uLocalModelMatrix;
        
        varying vec4 vColor;
        varying vec3 vNormal;
        varying vec3 vLightWeighting;
        
        const vec3 uLightPosition = vec3(-10, -50, -60);
        const vec3 uAmbientColor = vec3(0.5, 0.5, 0.5);
        const vec3 uDiffuseColor = vec3(1.0, 1.0, 1.0);
        const vec3 uSpecularColor = vec3(1.0, 1.0, 1.0);

        const float shininess = 20.0;
        
        

        void main(void) {


            // Get the vertex position in camera/eye coordinates and convert
            // the homogeneous coordinates back to the usual 3D coordinates for
            // subsequent calculations.
            vec4 vertexPositionEye4 = uModelViewMatrix * vec4(aVertexPosition, 1.0);
            vec3 vertexPositionEye3 = vertexPositionEye4.xyz /
            vertexPositionEye4.w;
            // Calculate the vector (L) to the point light source
            // First, transform the coordinate of light source into
            //eye coordinate system
            vec4 lightPositionEye4 = uModelViewMatrix * vec4(uLightPosition, 1.0);
            vec3 lightPositionEye3 = lightPositionEye4.xyz /
            lightPositionEye4.w;
            // Calculate the vector L
            vec3 vectorToLightSource = normalize(uLightPosition -
            vertexPositionEye3);
            // Transform the normal (N) to eye coordinates
            vec3 normalEye = normalize(aVertexNormal);
            // Calculate N dot L for diffuse lighting
            float diffuseLightWeighting = max(dot(normalEye, vectorToLightSource),
            0.0);
            // Calculate the reflection vector (R) that is needed for specular
            // light. Function reflect() is the GLSL function for calculation
            // of the reflective vector R
            vec3 reflectionVector = normalize(reflect(-vectorToLightSource,
            normalEye));
            // In terms of the camera coordinate system, the camera/eye
            // is alway located at in the origin (0.0, 0.0, 0.0) (because the
            // coordinate system is rigidly attached to the camera)
            // Calculate view vector (V) in camera coordinates as:
            // (0.0, 0.0, 0.0) - vertexPositionEye3
            vec3 viewVectorEye = -normalize(vertexPositionEye3);
            float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);
            float specularLightWeighting = pow(rdotv, shininess);
            // Sum up all three reflection components and send to the fragment
            // shader
            vLightWeighting = uAmbientColor +
            uDiffuseColor * diffuseLightWeighting +
            uSpecularColor * specularLightWeighting;

            gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            // vColor = vec4(finalColor, aVertexColor.a);
            vColor = aVertexColor * vec4(vLightWeighting, 1.0);
            // vColor = aVertexColor;
            vNormal = aVertexNormal;
            // vNormal = normalize(uNMatrix * aVertexNormal);
        }
    `;
    public fsTexSource: string = `
        precision mediump float;
        varying lowp vec4 vColor;
        varying highp vec2 vTextureCoord;
        varying highp vec3 vNormal;
        varying vec3 vLightWeighting;

        uniform sampler2D uSampler;

        void main() {      
            highp vec2 Coordinates = vec2( 0.5 + atan( vNormal.z, vNormal.x ) / ( 2. * 3.1415 ), 0.5 - asin( vNormal.y ) / 3.1415);

            vec4 textureColor = texture2D(uSampler, Coordinates);
            // gl_FragColor = texture2D(uSampler, Coordinates);
            gl_FragColor = vec4(vLightWeighting.rgb * textureColor.rgb,
                textureColor.a);
        }
  `;

    public vsColSource: string = `
            attribute vec3 aVertexPosition;
            attribute vec4 aVertexColor;
            attribute vec3 aVertexNormal;

            uniform mat3 uNMatrix;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uLocalModelMatrix;
            
            varying vec4 vColor;
            varying vec3 vNormal;
            varying vec3 vLightWeighting;
            
            const vec3 uLightPosition = vec3(-10, -20, -60);
            const vec3 uAmbientColor = vec3(0.5, 0.5, 0.5);
            const vec3 uDiffuseColor = vec3(1.0, 1.0, 1.0);
            const vec3 uSpecularColor = vec3(1.0, 1.0, 1.0);

            const float shininess = 32.0;
        

        void main(void) {
            // Get the vertex position in camera/eye coordinates and convert
            // the homogeneous coordinates back to the usual 3D coordinates for
            // subsequent calculations.
            vec4 vertexPositionEye4 = uModelViewMatrix * vec4(aVertexPosition, 1.0);
            vec3 vertexPositionEye3 = vertexPositionEye4.xyz /
            vertexPositionEye4.w;
            // Calculate the vector (L) to the point light source
            // First, transform the coordinate of light source into
            //eye coordinate system
            vec4 lightPositionEye4 = uModelViewMatrix * vec4(uLightPosition, 1.0);
            vec3 lightPositionEye3 = lightPositionEye4.xyz /
            lightPositionEye4.w;
            // Calculate the vector L
            // vec3 vectorToLightSource = normalize(lightPositionEye3 -
            // vertexPositionEye3);
            // The following line of code provides a different way to calculate
            // vector L. What is the difference between the two approaches?
            // Try it out.
            vec3 vectorToLightSource = normalize(uLightPosition -
            vertexPositionEye3);
            // Transform the normal (N) to eye coordinates
            vec3 normalEye = normalize(aVertexNormal);
            // Calculate N dot L for diffuse lighting
            float diffuseLightWeighting = max(dot(normalEye, vectorToLightSource),
            0.0);
            // Calculate the reflection vector (R) that is needed for specular
            // light. Function reflect() is the GLSL function for calculation
            // of the reflective vector R
            vec3 reflectionVector = normalize(reflect(-vectorToLightSource,
            normalEye));
            // In terms of the camera coordinate system, the camera/eye
            // is alway located at in the origin (0.0, 0.0, 0.0) (because the
            // coordinate system is rigidly attached to the camera)
            // Calculate view vector (V) in camera coordinates as:
            // (0.0, 0.0, 0.0) - vertexPositionEye3
            vec3 viewVectorEye = -normalize(vertexPositionEye3);
            float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);
            float specularLightWeighting = pow(rdotv, shininess);
            // Sum up all three reflection components and send to the fragment
            // shader
            vLightWeighting = uAmbientColor +
            uDiffuseColor * diffuseLightWeighting +
            uSpecularColor * specularLightWeighting;

            gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            // vColor = vec4(finalColor, aVertexColor.a);
            vColor = aVertexColor * vec4(vLightWeighting, 1.0);
            vColor = aVertexColor;
            vNormal = aVertexNormal;
        }
    `;
    public fsColSource: string = `
        precision mediump float;
        varying vec4 vColor;
        varying highp vec3 vNormal;
        varying vec3 vLightWeighting;

        void main() {      
            // gl_FragColor = vColor;
            gl_FragColor = vec4(vLightWeighting.rgb * vColor.rgb, 1.0);
        }
  `;



    public textureShader: Shader;
    public colorShader: Shader;


    public meshes: MeshTree | BaseMesh;
    public camera: Camera;
    then: number;
    rotation: number;
    orbitRadius: number;

    key: boolean[];
    orbitSpeed: number;
    mouse: MouseEvent;


    constructor() {
        this.key = [];
        this.mouse = {
            drag: false,
            transX: 0,
            transY: 0,
            transZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            offX: 0,
            offY: 0,
            offZ: 0,
        };
        this.setupInput();

        this.textureShader = new Shader(gl, this.vsTexSource, this.fsTexSource);
        this.colorShader = new Shader(gl, this.vsColSource, this.fsColSource);

        let satellite = new Model();

        this.orbitRadius = 45;
        this.orbitSpeed = 0.2;
        // satellite

        satellite.addMesh("root", new Cube(this.colorShader, 3)
            .setPos(50, -10, 0)
            .setColor(0.9, 0.7, 0)
            .setFaceColor(3, 0.388, 0.388, 0.388)
            .setFaceColor(2, 0.388, 0.388, 0.388)
            .lookAt(0, 0, 0)
            .rotate([0, 180, 0])
        );

        satellite.addMesh("pole1", new Cylinder(this.colorShader, 0.4, 0.8, 100)
            .setPos(4, 0, 0)
            .rotate([0, 0, 90])
            .setColor(0.7, 0.7, 0.7)
        );
        satellite.addMesh("pole2", new Cylinder(this.colorShader, 0.4, 0.8, 100)
            .setPos(-3, 0, 0)
            .rotate([0, 0, 90])
            .setColor(0.7, 0.7, 0.7)
        );

        satellite.addMesh("solar1", new Rect(this.colorShader, 5, 0.6, 2)
            .setPos(6.3, 0, 0)
            .setColor(0.176, 0.333, 0.807)
        );
        satellite.addMesh("solar2", new Rect(this.colorShader, 5, 0.6, 2)
            .setPos(-6.3, 0, 0)
            .setColor(0.176, 0.333, 0.807)
        );

        satellite.addMesh("antenna", new Cylinder(this.colorShader, 0.3, 1, 100)
            .setPos(0, 0, 3)
            .rotate([90, 0, 0])
            .setColor(0.7, 0.7, 0.7)

        );

        satellite.addMesh("dish", new Hemisphere(this.colorShader, 4, 100, 100)
            .setColor(0.9, 0.7, 0)

            .setPos(0, 0, 8)
            .rotate([-90, 0, 0])
        );

        satellite.addMesh("dishtop", new CircularPlane(this.colorShader, 4, 100)
            .setColor(1, 1, 1)
            .setPos(0, 0, 8)
            .rotate([-90, 0, 0])
        );
        // satellite.addMesh("solar3", new Rect(this.colorShader, 5, 5).setPos(0, 10, 0));




        // (satellite.getMesh("root") as Cube).setPos(0, 20, 0);
        // (satellite.getMesh("solar1") as Rect).setPos(-20, 0, 0);

        // let earth = new Model();
        // earth.addMesh("root", new Sphere(this.textureShader, 30, 100, 100).rotate([0, 0, 180]))
        this.meshes = {

            satellite,
            earth: new Sphere(this.textureShader, 30, 100, 100).rotate([0, -60, -180])


            // pole1: new Cylinder(this.colorShader, 0.4, 0.8, 100),
            // pole2: new Cylinder(this.colorShader, 0.4, 0.8, 100),
            // body: new Cube(this.colorShader, 3),
            // solar1: new Rect(this.colorShader, 5, 20),
        }

        // this.meshes = [
        //     // new CubeMesh(this.shader),
        //     // new Hemisphere(this.colorShader, 1, 100, 100)
        //     // new Sphere(this.textureShader, 30, 100, 100),
        //     // new Cube(this.colorShader, 3),

        //     new Cylinder(this.colorShader, 0.4, 0.8, 100),
        //     new Cylinder(this.colorShader, 0.4, 0.8, 100),
        //     new Cube(this.colorShader, 3),
        //     new Rect(this.colorShader, 5, 20),



        this.camera = new Camera();
        this.camera.setPos(0, 0, -200);
        gl.useProgram(this.colorShader.shaderProgram);

        this.rotation = 0;
        this.then = 0;
    }

    setupInput() {
        document.addEventListener("keydown", (e) => {
            this.key[e.keyCode] = true;
        });

        document.addEventListener("keyup", (e) => {
            this.key[e.keyCode] = false;
        });

        canvas.addEventListener("mousedown", (ev) => {
            this.mouse.drag = true;
            this.mouse.offX = ev.clientX;
            this.mouse.offY = ev.clientY;
        });

        canvas.addEventListener("mouseup", (ev) => {
            this.mouse.drag = false;
        });

        canvas.addEventListener("mousemove", (ev) => {
            const mouse = this.mouse;
            if (!mouse.drag) return;
            if (ev.shiftKey) {
                // console.log("shifting")
                mouse.transX = (ev.clientX - mouse.offX) / 10;
                //zRot = (xOffs - ev.clientX)*.3;
            } else if (ev.altKey) {
                mouse.transY = -(ev.clientY - mouse.offY) / 10;
            } else {
                mouse.rotY = - mouse.offX + ev.clientX;
                mouse.rotX = - mouse.offY + ev.clientY;
            }
            mouse.offX = ev.clientX;
            mouse.offY = ev.clientY;
            //console.log("xOff= "+xOffs+" yOff="+yOffs);
        });

        function wheelHandler(ev, mouse: MouseEvent) {
            if (mouse.drag) return;
            if (ev.altKey) mouse.transY = -ev.detail / 10;
            else mouse.transZ = ev.detail;
            //console.log("delta ="+ev.detail);
            // console.log(mouse.transZ);
            ev.preventDefault();
        }

        canvas.addEventListener('mousewheel', (ev) => { wheelHandler(ev, this.mouse) }, false);
        canvas.addEventListener('DOMMouseScroll', (ev) => { wheelHandler(ev, this.mouse) }, false);
    }

    async loadShaderFile(fileName) {
        try {
            const response = await fetch(`./${fileName}`);
            const fileContent = await response.text();
            return fileContent;
        } catch (error) {
            console.error(error);
        }
    }

    render(now: number) {
        now *= 0.001;
        let deltaTime = now - this.then;
        this.then = now;

        this.rotation = this.orbitSpeed + this.rotation + deltaTime * 10;

        if (this.key[39])
            this.orbitRadius += 0.4;
        if (this.key[37] && this.orbitRadius > 45)
            this.orbitRadius -= 0.4;

        if (this.key[38] && this.orbitSpeed < 3) {
            this.orbitSpeed *= 1.02;
        }
        if (this.key[40] && this.orbitSpeed > 1) {
            this.orbitSpeed -= 0.1;
        }


        for (const key in this.meshes) {
            const mesh: BaseMesh | Model = this.meshes[key];
            if (mesh instanceof Model) {

                // mesh.meshes["root"].rotateAround([0, 1, 1], [-20, 0, 0], this.camera.modelViewMatrix);
                // mesh.meshes["root"].rotate([this.mouse.rotX/2, this.mouse.rotY/2, this.mouse.rotZ/2]);

            }
            mesh.rotate([-this.mouse.rotX / 2, -this.mouse.rotY / 2, -this.mouse.rotZ / 2]);

        }
        this.camera.move(this.mouse.transX, this.mouse.transY, this.mouse.transZ);
        // this.camera.rotate([this.mouse.rotX/2, this.mouse.rotY/2, this.mouse.rotZ/2]);

        this.mouse.rotX = this.mouse.rotY = this.mouse.rotZ = this.mouse.transX = this.mouse.transY = this.mouse.transZ = 0;

        gl.clearColor(0.0, 0.1, 0.2, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        function extractRotation(matrix: mat4): vec3 {
            const rotation: vec3 = vec3.create();

            // Extract the rotation angles from the rotation matrix
            rotation[0] = Math.atan2(matrix[9], matrix[10]) * (180 / Math.PI); // Pitch
            rotation[1] = Math.atan2(-matrix[8], Math.sqrt(matrix[9] * matrix[9] + matrix[10] * matrix[10])) * (180 / Math.PI); // Yaw
            rotation[2] = Math.atan2(matrix[4], matrix[0]) * (180 / Math.PI); // Roll

            return rotation;
        }
        let earthRotation = extractRotation(this.meshes["earth"].modelViewMatrix);
        // mat4.getRotation(earthRotation, this.meshes["earth"].modelViewMatrix);
        (this.meshes["satellite"] as Model).orbit(this.orbitRadius, this.rotation, 120, earthRotation);
        // (this.meshes["satellite"] as Model).rotate([0, 0, 70])

        // this.meshes["satellite"].lookAt(0, 0, 0).rotate([0, 180, 0])

        this.meshes["earth"].rotate([0, 0.2, 0]);


        for (const key in this.meshes) {
            const mesh = this.meshes[key];

            gl.useProgram(mesh.shader.shaderProgram);
            this.camera.uniformAttrib(mesh.shader);
            let localModelViewMatrix = mat4.create();

            mat4.mul(localModelViewMatrix, this.camera.modelViewMatrix, mesh.modelViewMatrix);

            if (mesh instanceof BaseMesh) {
                gl.uniformMatrix4fv(
                    mesh.shader.getUniform("uModelViewMatrix"),
                    false,
                    localModelViewMatrix,
                );
            }


            mesh.draw(this.camera.modelViewMatrix);
        }

        requestAnimationFrame((n) => {
            this.render(n);
        })
    }
}