varying lowp vec4 vColor;
    varying highp vec2 vTextureCoord;
    varying highp vec3 vNormal;

    uniform sampler2D uSampler;

    void main() {      
        highp vec2 Coordinates = vec2( 0.5 + atan( vNormal.z, vNormal.x ) / ( 2. * 3.1415 ), 0.5 - asin( vNormal.y ) / 3.1415);

        gl_FragColor = texture2D(uSampler, Coordinates);
    }