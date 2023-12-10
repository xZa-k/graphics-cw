import { mat4, vec3 } from "gl-matrix";
import { gl } from "./graphics";
import { Shader } from "./shader";


export abstract class BaseMesh {
    public vertexBuffer: WebGLBuffer;
    public indexBuffer: WebGLBuffer;

    public shader: Shader;

    public verts: number[];
    indices: number[];
    modelViewMatrix: mat4;
    color: vec3 = [0, 1, 0];

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

        // this.useTexture("./img/earth.jpg");



    }

    abstract buildVerts();

    abstract draw();

    constructor(shader: Shader) {
        this.shader = shader;

        this.setupBuffers();
        this.modelViewMatrix = mat4.create();
    }

    setColor(r: number, g: number, b: number) {
        this.color = vec3.create();
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;

        // update buffers, bit inefficent but whatever
        this.buildVerts();
        this.setupBuffers();
    }

    setPos(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, mat4.create(), [x, y, z]);
    }

    move(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [x, y, z]);
    }

    setRotation(axis: vec3) {
        // let rad = rotation * (Math.PI / 180);
        mat4.rotateX(this.modelViewMatrix, mat4.create(), axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));
    }

    rotate(axis: vec3) {
        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));
    }
}

export class Cube extends BaseMesh {
    size: number;

    constructor(shader: Shader, size: number = 1) {
        super(shader);
        this.size = size;
        this.buildVerts();


        // this.buildVerts();
        this.setupBuffers();
    }

    setFaceColor(face: number, r: number, g: number, b: number) {
        const offset = 3;
        console.log(this.verts)
        this.color = vec3.create();
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;

        for (let i = 0; i < 4; i++) {
            const vi = i * (10) + offset + (face * 10 * 4);
            console.log(vi);
            this.verts[vi] = r;
            this.verts[vi+1] = g;
            this.verts[vi+2] = b;

            
        }
        // console.log(offset)
        // console.log(this.verts[offset], this.verts[offset + 1], this.verts[offset + 2]);

        // this.verts[offset] = r;
        // this.verts[offset + 1] = g;
        // this.verts[offset + 2] = b;
        // console.log(this.verts[offset], this.verts[offset + 1], this.verts[offset + 2]);
        this.setupBuffers();
    }

    buildVerts() {
        const size = this.size;
        const r = this.color[0];
        const g = this.color[1];
        const b = this.color[2];
        this.verts = [
            // x, y, z, r, g, b, a, nx, ny, nz
            // Front face
            -size, -size, size, r, g, b, 1.0, 0, 0, 1,
            -size, size, size, r, g, b, 1.0, 0, 0, 1,
            size, size, size, r, g, b, 1.0, 0, 0, 1,
            size, -size, size, r, g, b, 1.0, 0, 0, 1,

            // Back face
            -size, -size, -size, r, g, b, 1.0, 0, 0, -1,
            -size, size, -size, r, g, b, 1.0, 0, 0, -1,
            size, size, -size, r, g, b, 1.0, 0, 0, -1,
            size, -size, -size, r, g, b, 1.0, 0, 0, -1,

            // Left face
            -size, -size, -size, r, g, b, 1.0, -1, 0, 0,
            -size, size, -size, r, g, b, 1.0, -1, 0, 0,
            -size, size, size, r, g, b, 1.0, -1, 0, 0,
            -size, -size, size, r, g, b, 1.0, -1, 0, 0,

            // Right face
            size, -size, -size, r, g, b, 1.0, 1, 0, 0,
            size, size, -size, r, g, b, 1.0, 1, 0, 0,
            size, size, size, r, g, b, 1.0, 1, 0, 0,
            size, -size, size, r, g, b, 1.0, 1, 0, 0,

            // Top face
            -size, size, -size, r, g, b, 1.0, 0, 1, 0,
            -size, size, size, r, g, b, 1.0, 0, 1, 0,
            size, size, size, r, g, b, 1.0, 0, 1, 0,
            size, size, -size, r, g, b, 1.0, 0, 1, 0,

            // Bottom face
            -size, -size, -size, r, g, b, 1.0, 0, -1, 0,
            -size, -size, size, r, g, b, 1.0, 0, -1, 0,
            size, -size, size, r, g, b, 1.0, 0, -1, 0,
            size, -size, -size, r, g, b, 1.0, 0, -1, 0,
        ];

        // still using indices since id have to change the code to allow to switch
        // between arrays and elements

        this.indices = [
            // Front face
            0, 1, 2, 0, 2, 3,
            // Back face
            4, 5, 6, 4, 6, 7,
            // Left face
            8, 9, 10, 8, 10, 11,
            // Right face
            12, 13, 14, 12, 14, 15,
            // Top face
            16, 17, 18, 16, 18, 19,
            // Bottom face
            20, 21, 22, 20, 22, 23,
        ];




        // this.indices = [
        //     0, 2, 1, 0, 3, 2,
        //     4, 3, 0, 4, 7, 3,
        //     4, 1, 5, 4, 0, 1,
        //     3, 6, 2, 3, 7, 6,
        //     1, 6, 5, 1, 2, 6,
        //     7, 5, 6, 7, 4, 5
        // ];

    }

    setupBuffers() {
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexBuffer = gl.createBuffer();
        console.log("update vert")

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
    }

    draw() {
        this.bindBuffers();


        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

export class Rect extends BaseMesh {
    height: number;
    width: number;

    constructor(shader: Shader, height: number, width: number) {
        super(shader);
        this.height = height;
        this.width = width
        this.buildVerts();


        // this.buildVerts();
        this.setupBuffers();
    }

    buildVerts() {
        const height = this.height;
        const width = this.width;

        const r = this.color[0];
        const g = this.color[1];
        const b = this.color[2];
        // console.log(this.verts);

        this.verts = [
            // x, y, z, r, g, b, a, nx, ny, nz
            -width / 2, -height / 2, 0, r, g, b, 1.0, 0, 0, 1,
            -width / 2, height / 2, 0, r, g, b, 1.0, 0, 0, 1,
            width / 2, height / 2, 0, r, g, b, 1.0, 0, 0, 1,
            width / 2, -height / 2, 0, r, g, b, 1.0, 0, 0, 1,

            // Back face
            -width / 2, -height / 2, height, r, g, b, 1.0, 0, 0, -1,
            -width / 2, height / 2, height, r, g, b, 1.0, 0, 0, -1,
            width / 2, height / 2, height, r, g, b, 1.0, 0, 0, -1,
            width / 2, -height / 2, height, r, g, b, 1.0, 0, 0, -1,
        ];

        this.indices = [
            0, 2, 1, 0, 3, 2,
            4, 3, 0, 4, 7, 3,
            4, 1, 5, 4, 0, 1,
            3, 6, 2, 3, 7, 6,
            1, 6, 5, 1, 2, 6,
            7, 5, 6, 7, 4, 5
        ];

    }

    setupBuffers() {
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
        console.log("HELLO");
    }

    draw() {
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


    setupBuffers() {
        super.setupBuffers()


        this.texture = gl.createTexture();

    }

    useTexture(img) {
        const imgElement = new Image();
        imgElement.src = img;
        gl.bindTexture(gl.TEXTURE_2D, null);

        imgElement.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, imgElement);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // console.log("loaded")
        }
        document.body.append(imgElement);
    }

    bindBuffers() {
        super.bindBuffers();


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(this.shader.getUniform("uSampler"), 0);
        // gl.uniformMatrix4fv(this.shader.getUniform("uLocalModelMatrix"), false, this.modelViewMatrix)

    }

    draw() {
        this.bindBuffers();

        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

export class Hemisphere extends BaseMesh {

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
        this.useTexture("img/earth.jpg");
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
            let theta = i * (Math.PI) / m / 2;

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


    setupBuffers() {
        super.setupBuffers()


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
        super.bindBuffers();


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.uniform1i(this.shader.getUniform("uSampler"), 0);

    }

    draw() {
        this.bindBuffers();

        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}


export class Cylinder extends BaseMesh {

    r: number;
    n: number;
    h: number;
    texture: WebGLTexture;


    constructor(shader: Shader, r: number, h: number, n: number) {
        super(shader);

        this.shader = shader;


        this.r = r;
        this.h = h;
        this.n = n;

        this.buildVerts();
        this.setupBuffers();
    }

    buildVerts() {
        let verticies = [];
        let indices = [];
        let r = this.r;
        let h = this.h;
        let n = this.n;

        let red = 0;
        let green = 1;
        let blue = 0;

        // build vertices
        for (let j = 0; j < n; j++) {
            let theta = (j / n) * 2 * Math.PI;

            let nx = Math.cos(theta);
            let ny = (j / n) * h;
            let nz = Math.sin(theta);

            let x = nx * r;
            let y = ny * r;
            let z = nz * r;
            verticies.push(...[x, 0, z, red, green, blue, 1, nx, ny, nz]);
        }

        for (let j = 0; j < n; j++) {
            let theta = (j / n) * 2 * Math.PI;

            let nx = Math.cos(theta);
            let ny = (j / n) * h;
            let nz = Math.sin(theta);

            let x = nx * r;
            let y = ny * r;
            let z = nz * r;
            verticies.push(...[x, h, z, red, green, blue, 1, nx, ny, nz]);
        }

        for (let i = 0; i < n; i++) {
            indices.push(i);
            indices.push((i + 1) % n);
            indices.push(i + n);

            indices.push((i + 1) % n);
            indices.push((i + 1) % n + n);
            indices.push(i + n);
        }


        console.log(verticies)
        // build indices
        // let theta = i*(Math.PI)/m;
        // for (let j = 0; j < n; j++) {
        //     let v1 = i * (n + 1) + j;//index of vi,j
        //     let v2 = v1 + n + 1; //index of vi+1,j
        //     let v3 = v1 + 1; //index of vi,j+1
        //     let v4 = v2 + 1;
        //     indices.push(...[v1, v2, v3, v3, v2, v4]);
        // }

        this.verts = verticies;
        this.indices = indices;
    }


    setupBuffers() {
        super.setupBuffers()
    }


    bindBuffers() {
        super.bindBuffers();
    }

    draw() {
        this.bindBuffers();

        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_SHORT, 0);
        // gl.drawArrays(gl.TRIANGLES, 0, 22);
    }
}