#pragma once

#include "raylib.h"
#include "gametypes.h"
#include "game.h"

struct GameController
{
    Camera3D camera;
    f32 camSpeed;

    void UpdateCameraMovement(float deltaTime);

    static GameController Create();

    void Update(float deltaTime, Game* game);
};
