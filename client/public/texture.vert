attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

attribute vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vNormal;


void main(void) {
    gl_Position =  uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vColor = aVertexColor;
    vNormal = aVertexNormal;
}