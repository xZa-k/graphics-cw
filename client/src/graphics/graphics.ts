import { mat4, quat } from "gl-matrix";
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
        // attribute vec2 aTextureCoord;
       

        attribute vec3 aVertexNormal;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uLocalModelMatrix;

        varying vec4 vColor;
        varying vec2 vTextureCoord;
        varying vec3 vNormal;
        

        void main(void) {
            gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            
            vColor = aVertexColor;
            vNormal = aVertexNormal;
        }
    `;
    public fsTexSource: string = `
        varying lowp vec4 vColor;
        varying highp vec2 vTextureCoord;
        varying highp vec3 vNormal;

        uniform sampler2D uSampler;

        void main() {      
            highp vec2 Coordinates = vec2( 0.5 + atan( vNormal.z, vNormal.x ) / ( 2. * 3.1415 ), 0.5 - asin( vNormal.y ) / 3.1415);
            gl_FragColor = texture2D(uSampler, Coordinates);
        }
  `;

    public vsColSource: string = `
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;

        attribute vec3 aVertexNormal;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec4 vColor;
        varying vec3 vNormal;
        

        void main(void) {
            gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
            vNormal = aVertexNormal;
        }
    `;
    public fsColSource: string = `
    varying lowp vec4 vColor;
    varying highp vec3 vNormal;

        void main() {      
            gl_FragColor = vColor;

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
            .lookAt(0, 0, 0, this.camera)
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

        function wheelHandler(ev, mouse) {
            if (ev.altKey) mouse.transY = -ev.detail / 10;
            else mouse.transZ = ev.detail;
            //console.log("delta ="+ev.detail);
            console.log(mouse.transZ);
            ev.preventDefault();
        }

        canvas.addEventListener('mousewheel', (ev) => {wheelHandler(ev, this.mouse)}, false);
        canvas.addEventListener('DOMMouseScroll', (ev) => {wheelHandler(ev, this.mouse)}, false);
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
        console.log(this.mouse.drag)
        this.then = now;

        this.rotation = this.orbitSpeed + this.rotation + deltaTime * 10;

        if (this.key[39])
            this.orbitRadius += 0.4;
        if (this.key[37] && this.orbitRadius > 45)
            this.orbitRadius -= 0.4;

        if (this.key[38] && this.orbitSpeed < 3) {
            this.orbitSpeed *= 1.02;
            console.log(this.orbitSpeed)
        }
        if (this.key[40] && this.orbitSpeed > 1) {
            this.orbitSpeed -= 0.1;
        }

        this.camera.move(this.mouse.transX, this.mouse.transY, this.mouse.transZ);
        this.camera.rotate([this.mouse.rotX/2, this.mouse.rotY/2, 0]);

        this.mouse.rotZ = this.mouse.rotZ = this.mouse.rotZ = this.mouse.transX = this.mouse.transY = this.mouse.transZ = 0;

        gl.clearColor(0.0, 0.1, 0.2, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        (this.meshes["satellite"] as Model).orbit(this.orbitRadius, this.rotation, 60)
        this.meshes["satellite"].meshes["root"].lookAt(0, 0, 0, this.camera).rotate([0, 180, 0])

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


            mesh.draw(this.camera);
        }

        requestAnimationFrame((n) => {
            this.render(n);
        })
    }
}