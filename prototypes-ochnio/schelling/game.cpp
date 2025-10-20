#include <cassert>

#include "game.h"

#include "gametypes.h"
#include "aabb.h"

#include "resources.h"

#include "world.h"
#include "worldrendering.h"

#include "gamesettings.h"
#include "inhabitant.h"

#define RLIGHTS_IMPLEMENTATION
#include "rlights.h"

#include "raymath.h"

void Game::Update(f32 dt)
{
    if (IsKeyDown(KEY_SPACE))
    {
        sInhabitants.StartNextTurn();
    }

    sInhabitants.UpdateCellMovement(dt);
}



Game Game::Create()
{

    GameSettings::Init();
    Game game {};

    game.resources.Init();

    game.world = World::Create();

    game.sInhabitants = InhabitantSystem::Create();

    game.world.Randomize();
    game.sInhabitants.Populate();


    Shader s = game.resources.shaders["LightingShader"];

    game.sunLight = CreateLight(LIGHT_DIRECTIONAL,
                                 {10, 10, 10},
                                 {0, 0, 0},
                                 WHITE,
                                 s);

    return game;
};

void Game::Draw(f32 dt, V2<i32> centerPosition)
{

    ClearBackground(RAYWHITE);


    AABB<i32> cullingBox = GetDrawSlice(centerPosition);

    worldDrawing.DrawWorld(&world, cullingBox);
    sInhabitants.Draw(cullingBox, &resources);

}

AABB<i32> Game::GetDrawSlice(V2<i32> centerPosition)
{
    WorldSettings& ws = GameSettings::worldSettings;

    int xMin = centerPosition.x - (drawSize / 2);
    int yMin = centerPosition.y - (drawSize / 2);

    int xMax = centerPosition.x + (drawSize / 2);
    int yMax = centerPosition.y + (drawSize / 2);

    xMin = Clamp(xMin, 0, ws.size);
    yMin = Clamp(yMin, 0, ws.size);

    xMax = Clamp(xMax, 0, ws.size);
    yMax = Clamp(yMax, 0, ws.size);

    return {
        .xMin = xMin,
        .xMax = xMax,
        .yMin = yMin,
        .yMax = yMax,
    };
}
