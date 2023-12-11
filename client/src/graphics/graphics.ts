import { mat4, quat } from "gl-matrix";
import { Camera } from "./camera";
import { BaseMesh, Cube, Cylinder, Hemisphere, Rect, Sphere } from "./mesh";
import { Shader } from "./shader";
import { MeshTree, Model } from "./model";


const canvas: HTMLCanvasElement = document.querySelector("#glcanvas");
export const gl: WebGLRenderingContext = canvas.getContext("webgl");

if (gl == null) {
    alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
    )
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


    public meshes: MeshTree;
    public camera: Camera;
    then: number;
    rotation: number;

    constructor() {
        this.textureShader = new Shader(gl, this.vsTexSource, this.fsTexSource);
        this.colorShader = new Shader(gl, this.vsColSource, this.fsColSource);

        let satellite = new Model();
        satellite.addMesh("root", new Cube(this.colorShader, 3).setPos(20, -10, 0));
        satellite.addMesh("pole1", new Cylinder(this.colorShader, 0.4, 0.8, 100));
        satellite.addMesh("pole2", new Cylinder(this.colorShader, 0.4, 0.8, 100));
        satellite.addMesh("solar1", new Rect(this.colorShader, 5, 20).setPos(0, 10, 0));
        satellite.addMesh("solar2", new Rect(this.colorShader, 5, 20).setPos(-20, 0, 0));
        // satellite.addMesh("solar3", new Rect(this.colorShader, 5, 5).setPos(0, 10, 0));




        // (satellite.getMesh("root") as Cube).setPos(0, 20, 0);
        // (satellite.getMesh("solar1") as Rect).setPos(-20, 0, 0);


        this.meshes = {
            satellite
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
        this.camera.setPos(0, 0, -110);
        gl.useProgram(this.colorShader.shaderProgram);

        this.rotation = 0;
        this.then = 0;


        // this.meshes[0].setPos(-20, 0, 0);
        // this.meshes[0].rotate([0, 0, 90]);

        // this.meshes[1].setPos(4, 0, 0);
        // this.meshes[1].rotate([0, 0, 90]);

        // (this.meshes[2] as Cube).setFaceColor(2, 1, 0, 0);
        // (this.meshes[2] as Cube).setFaceColor(3, 1, 0, 0);
        // (this.meshes['body'] as Cube).setFaceColor(2, 1, 0, 0);
        // (this.meshes['body'] as Cube).setFaceColor(3, 1, 0, 0);
        // this.meshes["body"].setPos(-20, 0, 0)
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
        // console.log(this.rotation);

        this.rotation = this.rotation + deltaTime * 10;



        gl.clearColor(0.0, 0.1, 0.2, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // this.meshes["body"].rotate([1, 1, 1]);
        // this.meshes[0].rotate([1, 1, 1]);
        // this.meshes[3].rotate([0, 1, 0]);

        // this.meshes[1].setPos(-deltaTime*10, 0, 0);
        // this.meshes[1].move(-1, 0, 0);

        // this.meshes[1].setPos(-40, 0, 0);



        for (const key in this.meshes) {
            const mesh = this.meshes[key];
            
            gl.useProgram(mesh.shader.shaderProgram);
            this.camera.uniformAttrib(mesh.shader);
            let localModelViewMatrix = mat4.create();
            
            mat4.mul(localModelViewMatrix, this.camera.modelViewMatrix, mesh.modelViewMatrix);

            if (mesh instanceof Model) {
                // localModelViewMatrix = (mesh as Model).update(this.camera);
            }

            
            mesh.draw(this.camera);
        }
        // console.log("rendered")
        requestAnimationFrame((n) => {
            this.render(n);
        })
    }
}