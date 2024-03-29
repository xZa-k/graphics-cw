import { mat3, mat4, vec3 } from "gl-matrix";
import { gl } from "./graphics";
import { Shader } from "./shader";
import { Camera } from "./camera";


export abstract class BaseMesh {
    vertexBuffer: WebGLBuffer;
    indexBuffer: WebGLBuffer;
    shader: Shader;

    verts: number[];
    indices: number[];

    // every mesh has its own modelviewmatrix
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

    // Sets up the basic attribs every mesh has
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


        // var normalMatrix = mat3.create();
        // mat4.toInverseMat3(pwgl.modelViewMatrix,
        // normalMatrix);
        // mat3.transpose(normalMatrix);
        // gl.uniformMatrix3fv(pwgl.uniformNormalMatrixLoc,
        // false, normalMatrix);
        // this.useTexture("./img/earth.jpg");



    }

    abstract buildVerts();

    abstract draw(camera: mat4);

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
        return this;
    }

    lookAt(x: number, y: number, z: number) {
        // mat4.lookAt(this.modelViewMatrix, this.modelViewMatrix, )
        // camera.modelViewMatrix.
        let meshPos: [number, number, number] = [this.modelViewMatrix[12], this.modelViewMatrix[13], this.modelViewMatrix[14]]
        mat4.targetTo(this.modelViewMatrix, meshPos, [x, y, z], [0, 1, 0]);
        return this;
    }

    setPos(x: number, y: number, z: number): this {
        mat4.translate(this.modelViewMatrix, mat4.create(), [x, y, z]);
        return this;
    }

    move(x: number, y: number, z: number) {
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, [x, y, z]);
    }

    setRotation(axis: vec3): this {
        // let rad = rotation * (Math.PI / 180);
        mat4.rotateX(this.modelViewMatrix, mat4.create(), axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));
        return this;
    }

    rotate(axis: vec3) {

        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));
        return this;
    }

    rotateAround(axis: vec3, origin: vec3, world: mat4) {
        let worldMatrix = mat4.create();
        mat4.multiply(worldMatrix, world, this.modelViewMatrix);
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, origin);


        mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, axis[0] * (Math.PI / 180));
        mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, axis[1] * (Math.PI / 180));
        mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, axis[2] * (Math.PI / 180));

        vec3.scale(origin, origin, -1); // Negate the translation vector
        mat4.translate(this.modelViewMatrix, this.modelViewMatrix, origin);
        // let newworld =   mat4.multiply(parentWorldMatrix, parentWorldMatrix, localMatrix);
        console.log()

        return this;
    }
}

export class Cube extends BaseMesh {
    size: number;

    constructor(shader: Shader, size: number = 1) {
        super(shader);
        this.size = size;
        this.buildVerts();
        this.setupBuffers();
    }

    setFaceColor(face: number, r: number, g: number, b: number) {
        const offset = 3;
        this.color = vec3.create();
        this.color[0] = r;
        this.color[1] = g;
        this.color[2] = b;

        // goes over every vertex and sets the color, maybe change to uniform
        for (let i = 0; i < 4; i++) {
            const vi = i * (10) + offset + (face * 10 * 4);
            this.verts[vi] = r;
            this.verts[vi+1] = g;
            this.verts[vi+2] = b;

            
        }
        this.setupBuffers();
        return this;
    }

    buildVerts() {
        const size = this.size;
        const r = this.color[0];
        const g = this.color[1];
        const b = this.color[2];
        this.verts = [
            // x, y, z, r, g, b, a, nx, ny, nz
            -size, -size, size, r, g, b, 1.0, 0, 0, 1,
            -size, size, size, r, g, b, 1.0, 0, 0, 1,
            size, size, size, r, g, b, 1.0, 0, 0, 1,
            size, -size, size, r, g, b, 1.0, 0, 0, 1,

            -size, -size, -size, r, g, b, 1.0, 0, 0, -1,
            -size, size, -size, r, g, b, 1.0, 0, 0, -1,
            size, size, -size, r, g, b, 1.0, 0, 0, -1,
            size, -size, -size, r, g, b, 1.0, 0, 0, -1,

            -size, -size, -size, r, g, b, 1.0, -1, 0, 0,
            -size, size, -size, r, g, b, 1.0, -1, 0, 0,
            -size, size, size, r, g, b, 1.0, -1, 0, 0,
            -size, -size, size, r, g, b, 1.0, -1, 0, 0,

            size, -size, -size, r, g, b, 1.0, 1, 0, 0,
            size, size, -size, r, g, b, 1.0, 1, 0, 0,
            size, size, size, r, g, b, 1.0, 1, 0, 0,
            size, -size, size, r, g, b, 1.0, 1, 0, 0,

            -size, size, -size, r, g, b, 1.0, 0, 1, 0,
            -size, size, size, r, g, b, 1.0, 0, 1, 0,
            size, size, size, r, g, b, 1.0, 0, 1, 0,
            size, size, -size, r, g, b, 1.0, 0, 1, 0,

            -size, -size, -size, r, g, b, 1.0, 0, -1, 0,
            -size, -size, size, r, g, b, 1.0, 0, -1, 0,
            size, -size, size, r, g, b, 1.0, 0, -1, 0,
            size, -size, -size, r, g, b, 1.0, 0, -1, 0,
        ];

        // still using indices since id have to change the code to allow to switch
        // between arrays and elements

        this.indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ];

    }

    setupBuffers() {
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        this.vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
    }

    draw(camera) {
        this.bindBuffers();
        let localModelViewMatrix = mat4.create();
        mat4.mul(localModelViewMatrix, camera, this.modelViewMatrix);
        gl.uniformMatrix4fv(
            this.shader.getUniform("uModelViewMatrix"),
            false,
            localModelViewMatrix,
        );

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

export class Rect extends BaseMesh {
    height: number;
    width: number;
    depth: number;

    constructor(shader: Shader, width: number, height: number, depth: number) {
        super(shader);
        this.height = height;
        this.width = width;
        this.depth = depth;
        this.buildVerts();
        this.setupBuffers();
    }

    buildVerts() {
        const halfWidth = this.width/2;
        const halfHeight = this.height/2;
        const halfDepth = this.depth/2;

        const r = this.color[0];
        const g = this.color[1];
        const b = this.color[2];

        // Same as cube but different params
        this.verts = [
            -halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, 0, 0, 1,
            -halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, 0, 0, 1,
            halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, 0, 0, 1,
            halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, 0, 0, 1,
    
            -halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, 0, 0, -1,
            halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, 0, 0, -1,
            halfWidth, halfHeight, halfDepth, r, g, b, 1.0, 0, 0, -1,
            -halfWidth, halfHeight, halfDepth, r, g, b, 1.0, 0, 0, -1,
    
            -halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, 0, 1, 0,
            -halfWidth, halfHeight, halfDepth, r, g, b, 1.0, 0, 1, 0,
            halfWidth, halfHeight, halfDepth, r, g, b, 1.0, 0, 1, 0,
            halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, 0, 1, 0,
    
            -halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, 0, -1, 0,
            halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, 0, -1, 0,
            halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, 0, -1, 0,
            -halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, 0, -1, 0,
    
            halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, 1, 0, 0,
            halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, 1, 0, 0,
            halfWidth, halfHeight, halfDepth, r, g, b, 1.0, 1, 0, 0,
            halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, 1, 0, 0,
    
            -halfWidth, -halfHeight, -halfDepth, r, g, b, 1.0, -1, 0, 0,
            -halfWidth, -halfHeight, halfDepth, r, g, b, 1.0, -1, 0, 0,
            -halfWidth, halfHeight, halfDepth, r, g, b, 1.0, -1, 0, 0,
            -halfWidth, halfHeight, -halfDepth, r, g, b, 1.0, -1, 0, 0,
        ];

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
        imgElement.hidden = true;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        imgElement.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, imgElement);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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

    draw(camera: mat4) {
        this.bindBuffers();
        
        let normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, this.modelViewMatrix);

        // Take the transpose of the upper-left 3x3 matrix
        mat3.transpose(normalMatrix, normalMatrix);
        gl.uniformMatrix3fv(this.shader.getUniform("uNMatrix"), false, normalMatrix);

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
    }

    buildVerts() {
        let verticies = [];
        let indices = [];
        let r = this.r;
        let m = this.m;
        let n = this.n;

        let red = this.color[0];
        let green = this.color[1];
        let blue = this.color[2];

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
            for (let j = 0; j < n; j++) {
                let v1 = i * (n + 1) + j;
                let v2 = v1 + n + 1; 
                let v3 = v1 + 1; 
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

        let red = this.color[0];
        let green = this.color[1];
        let blue = this.color[2];

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


export class CircularPlane extends BaseMesh {

    r: number;
    n: number;
    h: number;
    texture: WebGLTexture;


    constructor(shader: Shader, r: number, n: number) {
        super(shader);

        this.shader = shader;


        this.r = r;
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

        let red = this.color[0];
        let green = this.color[1];
        let blue = this.color[2];
        verticies.push(...[0, 0, 0, red, green, blue, 1, 0, 0, 0]);
        // build vertices
        for (let i = 0; i < n; i++) {
            let theta = (i / n) * 2 * Math.PI;

            let nx = Math.cos(theta);
            let ny = 0;
            let nz = Math.sin(theta);

            let x = nx * r;
            let y = ny * r;
            let z = nz * r;
            verticies.push(...[x, 0, z, red, green, blue, 1, nx, ny, nz]);
        }

        for (let i = 0; i <= n; i++) {
            indices.push(0);
            indices.push(i);
            indices.push((i) % n);
        }

        indices.push(0)
        indices.push(n)
        indices.push(1)


        console.log("plane")
        console.log(indices)

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