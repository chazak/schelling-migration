#version 330

in vec3 fragNormal;
in vec3 fragPosition;
in vec4 vColor;

uniform vec3 lightDir;
uniform vec4 baseColor;

out vec4 finalColor;


void main() {
    // Normalize normal and light direction
    vec3 N = normalize(fragNormal);
    vec3 L = normalize(-lightDir);

    // Basic diffuse intensity
    float intensity = max(dot(N, L), 0.0);

    /*
    // Quantize the lighting for "toon" look
    if (intensity > 0.95) intensity = 1.0;
    else if (intensity > 0.5) intensity = 0.7;
    else if (intensity > 0.25) intensity = 0.4;
    else intensity = 0.1;
    */

    finalColor = vec4(vColor.rgb * intensity, vColor.a);
}
