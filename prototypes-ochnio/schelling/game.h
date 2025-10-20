#pragma once

#include "resources.h"

#include "world.h"
#include "worldrendering.h"

#include "inhabitant.h"

#include "gamesettings.h"

#include "rlights.h"


struct Game
{
    World world {};
    WorldDrawSystem worldDrawing {};

    InhabitantSystem sInhabitants {};


    Resources resources {};

    RenderTexture scaleTexture;

    // Some rendering resources
    // TODO Lights for now here to hook it up
    Light sunLight;
    Color ambientColor;


    int drawSize = 25;
    AABB<i32> GetDrawSlice(V2<i32> centerPosition);
    // end rendering stuff


    // Functions 
    static Game Create();

    void Draw(f32 dt, V2<i32> centerPosition);
    void Update (f32 dt);
};
