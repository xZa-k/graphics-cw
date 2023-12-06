import { mat4 } from "gl-matrix";
import { gl } from "./graphics";
import { Shader } from "./shader";



export class CubeMesh {

    public vertexBuffer: WebGLBuffer;
    public indexBuffer: WebGLBuffer;
    
    public shader: Shader;

    public verts: number[];
    indices: number[];
    modelViewMatrix: mat4;

    constructor(shader: Shader) {
        this.shader = shader;

        const size = 1;
        const r = 1;
        const g = 0;
        const b = 0;

        this.verts = [
      
            // x, y, z, nx, ny, nz, r, g, b, a, u, v
            -size, -size, size,  r, g, b, 1,
            -size, size, size, r, g, b, 1,
            size, size, size, r, g, b, 1,
            size, -size, size, r, g, b, 1,
            -size, -size, -size, r, g, b, 1,
            -size, size, -size,  r, g, b, 1,
            size, size, -size, r, g, b, 1,
            size, -size, -size, r, g, b, 1
        ];

        this.indices = [
            0, 2, 1, 0, 3, 2,
            4, 3, 0, 4, 7, 3,
            4, 1, 5, 4, 0, 1,
            3, 6, 2, 3, 7, 6,
            1, 6, 5, 1, 2, 6,
            7, 5, 6, 7, 4, 5 
        ];

        this.setupBuffers();
        this.modelViewMatrix = mat4.create();
    }
    
    setPos(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, mat4.create(), [x, y, z])
      }
    
    setupBuffers() {
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexPosition"),
            3,
            gl.FLOAT,
            false,
            7*4,
            0,
          );
          gl.enableVertexAttribArray(this.shader.getAttrb("aVertexPosition"));
      
          gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexColor"),
            3,
            gl.FLOAT,
            false,
            7*4,
            3*4,
          );
          gl.enableVertexAttribArray(this.shader.getAttrb("aVertexColor"));
    }

    draw() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        console.log(this.vertexBuffer);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}