#pragma once

#include "inhabitant.h"
#include "world.h"

struct GameSettings
{
    static WorldSettings worldSettings;
    static InhabitantsSettings inhabitantSettings;

    static void Init();
};
