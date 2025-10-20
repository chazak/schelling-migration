#version 330

layout(location = 0) in vec3 vertexPosition;
layout(location = 1) in vec3 vertexNormal;
layout(location = 3) in vec4 vertexColor;

uniform mat4 mvp;

out vec3 fragNormal;
out vec3 fragPosition;
out vec4 vColor;

void main() {
    fragPosition = vertexPosition;
    fragNormal = vertexNormal;
    vColor = vertexColor;
    gl_Position = mvp * vec4(vertexPosition, 1.0);
}
