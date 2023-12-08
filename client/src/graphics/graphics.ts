import { mat4 } from "gl-matrix";
import { Camera } from "./camera";
import { Cube, Sphere } from "./mesh";
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
    public vsSource: string = `
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;


        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;


        varying lowp vec4 vColor;

        void main(void) {
            gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            vColor = aVertexColor;
        }
    `;
    public fsSource: string = `
    varying lowp vec4 vColor;
        void main() {
        gl_FragColor = vColor;
        }
  `;
    public shader: Shader;

    public meshes: (Cube | Sphere)[];
    public camera: Camera;
    
    constructor() {

        this.shader = new Shader(gl, this.vsSource, this.fsSource);


        this.meshes = [
            // new CubeMesh(this.shader),
            // new CubeMesh(this.shader)
            new Sphere(this.shader, 1, 100, 100),
            new Sphere(this.shader, 1, 10, 10),
            
            // new Cube(this.shader)

        ];
        this.camera = new Camera();
        gl.useProgram(this.shader.shaderProgram);

    }

    render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        this.camera.uniformAttrib(this.shader);

        // sphere.draw();

        this.meshes[0].setPos(-2, -1, 0);
        // this.meshes[1].setPos(3, 1, 0);


        for (const mesh of this.meshes) {
            let localModelViewMatrix = mat4.create();
            mat4.mul(localModelViewMatrix, this.camera.modelViewMatrix, mesh.modelViewMatrix);
            gl.uniformMatrix4fv(
                this.shader.getUniform("uModelViewMatrix"),
                false,
                localModelViewMatrix,
            );
            mesh.draw();
        }
    }
}