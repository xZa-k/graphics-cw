import { mat4, vec3 } from "gl-matrix";
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
        this.zFar = 500.0;
        this.projectionMatrix = mat4.create();

        mat4.perspective(this.projectionMatrix, this.fov, this.aspect, this.zNear, this.zFar);

        this.modelViewMatrix = mat4.create();
        mat4.translate(
            this.modelViewMatrix,
            this.modelViewMatrix, 
            [0.0, 0.0, -10.0], // default starting position
        ); 
    }

    setPos(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, mat4.create(), [x, y, z]);
    }

    move(x: number, y: number, z: number) {
        let meshPos: [number, number, number] = [this.modelViewMatrix[12], this.modelViewMatrix[13], this.modelViewMatrix[14]]

        const phi = 90 * (Math.PI/180);
        const theta = 90 * (Math.PI/180);


        let nx = Math.sin(theta) * Math.cos(phi);
        let ny = Math.cos(theta);
        let nz = Math.sin(theta) * Math.sin(phi);

        let lx = nx * -200;
        let ly = ny * -200;
        let lz = nz * -200;

        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [x, y, z]);
        // mat4.lookAt(this.modelViewMatrix, [lx, ly, lz], [x, y, z], [0, 1, 0]);
    }

    rotate(axis: vec3) {


        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));
    }

    uniformAttrib(shader: Shader) {
        gl.uniformMatrix4fv(shader.getUniform("uModelViewMatrix"), false, this.modelViewMatrix);

        gl.uniformMatrix4fv(shader.getUniform("uProjectionMatrix"), false, this.projectionMatrix);
    }


}