#include "resources.h"

void Resources::Init()
{
    Mesh mesh = GenMeshCylinder(gDrawSize, gDrawHeight, 6);
    Model model = LoadModelFromMesh(mesh);

    Shader shader = LoadShader("shaders/lighting.vs",
                                "shaders/lighting.fs");

    shader.locs[SHADER_LOC_VECTOR_VIEW] = 
                                    GetShaderLocation( shader,
                                                       "ViewPos");

    shaders.emplace("LightingShader", shader);
    model.materials[0].shader = shader;

    models.emplace("InhabitantToken", model);
}

void Resources::Clean()
{
}
