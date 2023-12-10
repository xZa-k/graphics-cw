import { mat4, quat } from "gl-matrix";
import { Camera } from "./camera";
import { Cube, Hemisphere, Sphere } from "./mesh";
import { Shader } from "./shader";


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


    public meshes: (Cube | Sphere)[];
    public camera: Camera;
    then: number;
    rotation: number;

    constructor() {
        // let vsTextureP = this.loadShaderFile("texture.vert");
        // let fsTextureP = this.loadShaderFile("texture.frag");

        // Promise.all([vsTextureP, fsTextureP]).then((shaderSource) => {
        this.textureShader = new Shader(gl, this.vsTexSource, this.fsTexSource);
        // console.log(this.textureShader);
        this.colorShader = new Shader(gl, this.vsColSource, this.fsColSource);
        console.log(this.colorShader);
        this.meshes = [
            // new CubeMesh(this.shader),
            // new Hemisphere(this.colorShader, 1, 100, 100)
            new Sphere(this.textureShader, 30, 100, 100),
            new Cube(this.colorShader, 3),

            // new Sphere(this.textureShader, 1, 10, 10),

            // new Cube(this.shader)

        ];
        this.camera = new Camera();
        this.camera.setPos(0, 0, -110);
        gl.useProgram(this.colorShader.shaderProgram);
        // });

        this.rotation = 0;
        this.then = 0;

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

        this.meshes[0].setPos(-2, -1, 0);
        this.meshes[0].setRotation([0, 0, 180]);
        this.meshes[0].rotate([0, this.rotation, 0]);

        // this.meshes[1].setPos(-deltaTime*10, 0, 0);
        this.meshes[1].setPos(-40, 0, 0);


        for (const mesh of this.meshes) {
            gl.useProgram(mesh.shader.shaderProgram);
            this.camera.uniformAttrib(mesh.shader);
            let localModelViewMatrix = mat4.create();
            mat4.mul(localModelViewMatrix, this.camera.modelViewMatrix, mesh.modelViewMatrix);
            gl.uniformMatrix4fv(
                mesh.shader.getUniform("uModelViewMatrix"),
                false,
                localModelViewMatrix,
            );
            mesh.draw();
        }
        // console.log("rendered")
        requestAnimationFrame((n) => {
            this.render(n);
        })
    }

    // animate() {
    //     this.render();
    //     requestAnimationFrame(() => this.animate);
    //     // this.animate()
    // }
}