#include <cstdlib>
#include <cstdio>
#include <ctime>
#include <array>
#include <cassert>

#include "math.h"
#include "utils.h"
#include "raylib.h"

#define RAYLIB_NUKLEAR_IMPLEMENTATION
#include "thirdparty/raylib-nuklear/include/raylib-nuklear.h"

#include "game.h"
#include "gamecontroller.h"


int main(int argc, const char** argv)
{
    srand(time(0));

    InitWindow(1920, 1080, "Schelling Test");

    SetTargetFPS(30);
    
    Game game = Game::Create();

    nk_context* ctx = InitNuklear(12);
    SetNuklearScaling(ctx, 2.0f);

    GameController controller = GameController::Create();

    while (!WindowShouldClose())
    {
        UpdateNuklear(ctx);
        game.Update(GetFrameTime());

        controller.Update(GetFrameTime(), &game);

        V2<i32> center = {(i32)controller.camera.target.x,
                          (i32)controller.camera.target.z};


        BeginDrawing();

        BeginMode3D(controller.camera);

        game.Draw(GetFrameTime(), center);

        EndMode3D();

        DrawNuklear(ctx);

        EndDrawing();
    }

    CloseWindow();

    UnloadNuklear(ctx);

    exit(0);
}
