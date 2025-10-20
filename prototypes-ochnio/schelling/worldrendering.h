#pragma once


#include <cstddef>

#include "raylib.h"

#include "aabb.h"
#include "gametypes.h"
#include "world.h"


struct WorldDrawSystem
{

    V2<i32> cellHighlight = { i32Min, i32Min };

    Color tileColors[(size_t)ETileTypes::Count]
        = { YELLOW,
            BLUE,
            GRAY,
            GREEN,
        };



    void DrawWorld( World* world, AABB<i32> cullingBox);
    
    void HighlightCellAtPosition(V2<i32> position);
    void ResetHighlight();
};
