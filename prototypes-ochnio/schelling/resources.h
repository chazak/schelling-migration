#pragma once

#include <map>
#include <string>
#include "gametypes.h"
#include "raylib.h"


struct Resources
{
    static constexpr f32 gDrawSize = 0.25f;
    static constexpr f32 gDrawHeight = 0.2f;

    std::map<std::string, Model> models;
    std::map<std::string, Shader> shaders;

    void Init();
    void Clean();
};
