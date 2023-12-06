import { mat4 } from "gl-matrix";
import { gl } from "./graphics";
import { Shader } from "./shader";

export class Camera {

    public fov: number;
    public aspect: number;
    public zNear: number;
    public zFar: number;

    public projectionMatrix: mat4;
    public modelViewMatrix: mat4;

    constructor() {
        this.fov = (45 * Math.PI) / 180; // in radians
        this.aspect = gl.canvas.width / gl.canvas.height;
        this.zNear = 0.1;
        this.zFar = 100.0;
        this.projectionMatrix = mat4.create();

        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.zNear, this.zFar);

        this.modelViewMatrix = mat4.create();
        mat4.translate(
            this.modelViewMatrix,
            this.modelViewMatrix, 
            [-0.0, 0.0, -10.0],
        ); 
    }

    uniformAttrib(shader: Shader) {
        gl.uniformMatrix4fv(shader.getUniform("uModelViewMatrix"), false, this.modelViewMatrix);

        gl.uniformMatrix4fv(shader.getUniform("uProjectionMatrix"), false, this.projectionMatrix)
    }


}