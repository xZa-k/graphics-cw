import { mat4 } from "gl-matrix";
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

    rotate() {

    }

    setRotation() {

    }

    setPos() {

    }

    // update(camera: Camera): mat4 {
    //     let localModelViewMatrix = this.modelViewMatrix;
    //     for (const name in this.meshes) {
    //         if (name == "root") continue;
    //         const mesh = this.meshes[name];
    //         // mat4.add(localModelViewMatrix, this.modelViewMatrix, mesh.modelViewMatrix);
    //         mat4.mul(localModelViewMatrix, camera.modelViewMatrix, mesh.modelViewMatrix);
    //         mesh.draw(camera);
    //         localModelViewMatrix = this.modelViewMatrix;
    //     }

    //     return localModelViewMatrix;
    // }

    draw(camera: Camera) {
        let localModelViewMatrix = mat4.create();
        let t;
        t = mat4.mul(localModelViewMatrix, camera.modelViewMatrix, this.meshes["root"].modelViewMatrix);

        for (const name in this.meshes) {

            const mesh = this.meshes[name];
            // if (name == "root") continue;

            // mat4.add(localModelViewMatrix, this.modelViewMatrix, mesh.modelViewMatrix);

                // mat4.mul(localModelViewMatrix, camera.modelViewMatrix, mesh.modelViewMatrix);

                // localModelViewMatrix = mat4.create();
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