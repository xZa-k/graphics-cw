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
        // console.log(axis)
        
        this.meshes["root"].rotate(axis);
    }

    lookAt(x: number, y: number, z: number) {
        return this.meshes["root"].lookAt(x, y, z);
        
    }

    setRotation() {

    }

    setPos() {

    }

    orbit(r: number, phiDeg: number, thetaDeg: number, sphereRotation: vec3){
        const phi = phiDeg * (Math.PI/180);
        const theta = thetaDeg * (Math.PI/180);


        let nx = Math.sin(theta) * Math.cos(phi);
        let ny = Math.cos(theta);
        let nz = Math.sin(theta) * Math.sin(phi);

        let x = nx * r;
        let y = ny * r;
        let z = nz * r;
        // console.log(`x: ${x} y: ${y} z: ${z}`)
        // this.meshes["root"].rotate([2, 0, 0]);
        const rotationMatrix = mat4.create();
        mat4.rotateX(rotationMatrix, rotationMatrix, -sphereRotation[0] * (Math.PI / 180));
        mat4.rotateY(rotationMatrix, rotationMatrix, -sphereRotation[1] * (Math.PI / 180));
        mat4.rotateZ(rotationMatrix, rotationMatrix, -sphereRotation[2] * (Math.PI / 180));      

        // const pos = mat4.getTranslation(vec3.create(), this.modelViewMatrix)
        const rotatedPosition = vec3.transformMat4(vec3.create(), [x, y, z], rotationMatrix);
        this.meshes["root"].setPos(rotatedPosition[0], rotatedPosition[1], rotatedPosition[2]);
        this.meshes["root"].lookAt(0, 0, 0).rotate([0, 180, 0])
    }

    draw(camera: mat4) {
        let localModelViewMatrix = mat4.create();
        let t;
        t = mat4.mul(localModelViewMatrix, camera, this.meshes["root"].modelViewMatrix);

        for (const name in this.meshes) {

            const mesh = this.meshes[name];
            let offsetM: mat4 = mat4.create();
            mat4.mul(offsetM, camera, this.modelViewMatrix);
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