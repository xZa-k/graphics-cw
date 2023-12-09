import { mat4 } from "gl-matrix";
import { gl } from "./graphics";
import { Shader } from "./shader";


export abstract class BaseMesh {
    public vertexBuffer: WebGLBuffer;
    public indexBuffer: WebGLBuffer;

    public shader: Shader;

    public verts: number[];
    indices: number[];
    modelViewMatrix: mat4;

    abstract setupBuffers();
    abstract bindBuffers();

    abstract buildVerts();

    abstract draw();

    constructor(shader: Shader) {
        this.shader = shader;

        this.buildVerts();
        this.setupBuffers();
        this.modelViewMatrix = mat4.create();
    }

    setPos(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, mat4.create(), [x, y, z])
    }
}

export class Cube extends BaseMesh {

    constructor(shader: Shader) {
        super(shader);
        this.buildVerts();
        this.setupBuffers();
    }

    buildVerts() {
        const size = 1;
        const r = 1;
        const g = 1;
        const b = 0;

        this.verts = [

            // x, y, z, r, g, b, a, nx, ny, nz
            -size, -size, size, r, g, b, 1.0, 1, -1, -1,
            -size, size, size, r, g, b, 1.0, 1, 1, -1,
            size, size, size, r, g, b, 1.0, -1, 1, -1,
            size, -size, size, r, g, b, 1.0, 1, 1, -1,
            -size, -size, -size, r, g, b, 1.0, -1, 1, -1,
            -size, size, -size, r, g, b, 1.0, 1, 1, -1,
            size, size, -size, r, g, b, 1.0, -1, 1, -1,
            size, -size, -size, r, g, b, 1.0, 1, 1, -1,
        ];
        console.log(this.verts);
        this.indices = [
            0, 2, 1, 0, 3, 2,
            4, 3, 0, 4, 7, 3,
            4, 1, 5, 4, 0, 1,
            3, 6, 2, 3, 7, 6,
            1, 6, 5, 1, 2, 6,
            7, 5, 6, 7, 4, 5
        ];
        console.log(this.indices);

    }

    setupBuffers() {
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
    }

    bindBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);


        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexPosition"),
            3,
            gl.FLOAT,
            false,
            10 * 4,
            0,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexPosition"));

        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexColor"),
            4,
            gl.FLOAT,
            false,
            10 * 4,
            3 * 4,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexColor"));

        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexNormal"),
            3,
            gl.FLOAT,
            false,
            10 * 4,
            7 * 4,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexNormal"));

    }

    draw() {
        console.log(this.verts);
        console.log(this.indices)
        // this.setupBuffers();
        this.bindBuffers();


        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}


export class Sphere extends BaseMesh {

    r: number;
    n: number;
    m: number;
    texture: WebGLTexture;


    constructor(shader: Shader, r: number, m: number, n: number) {
        super(shader);

        this.shader = shader;


        this.r = r;
        this.m = m;
        this.n = n;

        this.buildVerts();
        this.setupBuffers();
        this.useTexture("img/earth.jpg")
    }

    buildVerts() {
        let verticies = [];
        let indices = [];
        let r = this.r;
        let m = this.m;
        let n = this.n;

        let red = 0;
        let green = 1;
        let blue = 0;

        // build vertices
        for (let i = 0; i <= m; i++) {
            let theta = i * (Math.PI) / m;
            for (let j = 0; j <= n; j++) {
                let phi = 2 * j * (Math.PI) / n;

                let nx = Math.sin(theta) * Math.cos(phi);
                let ny = Math.cos(theta);
                let nz = Math.sin(theta) * Math.sin(phi);

                let x = nx * r;
                let y = ny * r;
                let z = nz * r;
                verticies.push(...[x, y, z, red, green, blue, 1, nx, ny, nz]);
            }
        }

        // build indices
        for (let i = 0; i < m; i++) {
            // let theta = i*(Math.PI)/m;
            for (let j = 0; j < n; j++) {
                let v1 = i * (n + 1) + j;//index of vi,j
                let v2 = v1 + n + 1; //index of vi+1,j
                let v3 = v1 + 1; //index of vi,j+1
                let v4 = v2 + 1;
                indices.push(...[v1, v2, v3, v3, v2, v4]);

            }
        }

        this.verts = verticies;
        this.indices = indices;
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

        this.texture = gl.createTexture();

    }

    useTexture(img) {
        const imgElement = new Image();
        imgElement.src = img;

        imgElement.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, imgElement);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // console.log("loaded")
        }
        document.body.append(imgElement);
    }

    bindBuffers() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);


        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexPosition"),
            3,
            gl.FLOAT,
            false,
            10 * 4,
            0,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexPosition"));

        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexColor"),
            4,
            gl.FLOAT,
            false,
            10 * 4,
            3 * 4,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexColor"));

        gl.vertexAttribPointer(
            this.shader.getAttrb("aVertexNormal"),
            3,
            gl.FLOAT,
            false,
            10 * 4,
            7 * 4,
        );
        gl.enableVertexAttribArray(this.shader.getAttrb("aVertexNormal"));

        // this.useTexture("./img/earth.jpg");

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // console.log(this.texture);
        gl.uniform1i(this.shader.getUniform("uSampler"), 0);

    }

    draw() {
        console.log(this.indices);
        console.log(this.verts)
        // this.setupBuffers();
        this.bindBuffers();

        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}