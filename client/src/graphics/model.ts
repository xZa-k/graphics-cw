import { mat4, vec3 } from "gl-matrix";
import { BaseMesh } from "./mesh";
import { Shader } from "./shader";
import { Camera } from "./camera";
import { gl } from "./graphics";


// type MeshTree = {}

export interface MeshTree {
    [key: string]: (Model | BaseMesh)
}


export class Model {
    meshes: {
        [key: string]: BaseMesh
    };

    public get modelViewMatrix(): mat4 {
        return this.meshes["root"].modelViewMatrix;
    }
    public set modelViewMatrix(value: mat4) {
        this.meshes["root"].modelViewMatrix = value;
    }
    private _shader: Shader;
    public get shader(): Shader {
        return this.meshes["root"].shader;
    }

    constructor() {
        this.meshes = {};
    }

    rotate(axis: vec3) {
        this.meshes["root"].rotate(axis);
    }

    setRotation() {

    }

    setPos() {

    }

    orbit(r: number, phiDeg: number, thetaDeg: number){
        const phi = phiDeg * (Math.PI/180);
        const theta = thetaDeg * (Math.PI/180);


        let nx = Math.sin(theta) * Math.cos(phi);
        let ny = Math.cos(theta);
        let nz = Math.sin(theta) * Math.sin(phi);

        let x = nx * r;
        let y = ny * r;
        let z = nz * r;
        console.log(`x: ${x} y: ${y} z: ${z}`)
        this.meshes["root"].setPos(x, y, z);
    }

    draw(camera: Camera) {
        let localModelViewMatrix = mat4.create();
        let t;
        t = mat4.mul(localModelViewMatrix, camera.modelViewMatrix, this.meshes["root"].modelViewMatrix);

        for (const name in this.meshes) {

            const mesh = this.meshes[name];
            let offsetM: mat4 = mat4.create();
            mat4.mul(offsetM, camera.modelViewMatrix, this.modelViewMatrix);
            mat4.mul(localModelViewMatrix, offsetM, mesh.modelViewMatrix);

            gl.uniformMatrix4fv(
                mesh.shader.getUniform("uModelViewMatrix"),
                false,
                localModelViewMatrix,
            );
            mesh.draw(camera);
        }
    }

    addMesh(name: string, mesh: BaseMesh) {
        this.meshes[name] = mesh;
    }

    getMesh(name: string): BaseMesh {
        return this.meshes[name];
    }
}