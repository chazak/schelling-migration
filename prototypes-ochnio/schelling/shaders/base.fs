#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;
in vec3 fragNormal;

// Input uniform values
uniform sampler2D texture0;
uniform vec4 colDiffuse;
uniform vec3 lightDir;

// Output fragment color
out vec4 finalColor;

// NOTE: Add your custom variables here

void main()
{
    // Normalize normal and light direction
    vec3 N = normalize(fragNormal);
    vec3 L = normalize(-lightDir);

    // Basic diffuse intensity
    float intensity = max(dot(N, L), 0.0);

    // Texel color fetching from texture sampler
    vec4 texelColor = texture(texture0, fragTexCoord);

    // NOTE: Implement here your fragment shader code

    // final color is the color from the texture 
    //    times the tint color (colDiffuse)
    //    times the fragment color (interpolated vertex color)
    finalColor = colDiffuse * intensity;
}

