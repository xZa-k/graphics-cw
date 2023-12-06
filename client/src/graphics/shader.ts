export type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"];

export interface AttribLocations {
    [key: string]: number
}

export interface UniformLocations {
    [key: string]: WebGLUniformLocation
}

export class Shader {

    gl: WebGLRenderingContext
    shaderProgram: WebGLProgram;
    
    private attribLocations: AttribLocations;
    private uniformLocations: UniformLocations;

    constructor(gl: WebGLRenderingContext, vsSource: string, fsSource: string){
        this.gl = gl;
        this.attribLocations = {};
        this.uniformLocations = {};

        this.shaderProgram = this.initShaderProgram(vsSource, fsSource);
    }

    initShaderProgram(vsSource: string, fsSource: string) {
        const vShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = this.gl.createProgram();

        this.gl.attachShader(shaderProgram, vShader);
        this.gl.attachShader(shaderProgram, fShader);
        this.gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            alert(
            `Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
                shaderProgram,
            )}`,
            );
            return null;
        }
        return shaderProgram;
    }

    // Compiles a shader
    loadShader(shaderType: ShaderType, source: string) {
        const shader = this.gl.createShader(shaderType);

        this.gl.shaderSource(shader, source);

        // Compile the shader program

        this.gl.compileShader(shader);

        // See if it compiled successfully

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert(
            `An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(shader)}`,
            );
            this.gl.deleteShader(shader);
            return null;
        }
        console.log("shader compiled!");
        return shader;
    }

    getAttrb(name: string) {
        if (this.attribLocations[name] != undefined) return this.attribLocations[name];
        const attrb = this.gl.getAttribLocation(this.shaderProgram, name);
        return attrb;
    }

    getUniform(name: string) {
        if (this.uniformLocations[name] != undefined) return this.uniformLocations[name];
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name)
        return uniform;
    }
}
