#include "gamecontroller.h"
#include "math.h"
#include <cmath>

void GameController::Update(float deltaTime, Game* game)
{
    if (IsMouseButtonPressed(MouseButton::MOUSE_BUTTON_LEFT))
    {
        Ray ray = GetMouseRay(GetMousePosition(), camera);

        Vector3 position = { 0, 0, 0 };
        if(RayIntersectionPlane(ray,{0, 1, 0}, &position)) 
        {
            game->worldDrawing
                .HighlightCellAtPosition({(i32)roundf(position.x),
                                          (i32)roundf(position.z)});
        }

    }

    UpdateCameraMovement(deltaTime);
}

GameController
GameController::Create()
{

    GameController controller {};

    Camera3D camera = {};
    camera.position = {10, 10, 10};
    camera.target   = { 0.0f, 0.0f, 0.0f };
    camera.up       = { 0.0f, 1.0f, 0.0f };
    camera.fovy     = 10.0f;
    camera.projection = CAMERA_ORTHOGRAPHIC;

    controller.camera = camera;

    controller.camSpeed = 10.0f;

    return controller;

}

void 
GameController::UpdateCameraMovement(float deltaTime)
{
    if (IsKeyDown(KEY_D))
    {
        camera.target.x += camSpeed * deltaTime;
        camera.position.x += camSpeed * deltaTime;
    }
    
    if (IsKeyDown(KEY_S))
    {
        camera.target.z += camSpeed * deltaTime;
        camera.position.z += camSpeed * deltaTime;
    }

    if (IsKeyDown(KEY_A))
    {
        camera.target.x -= camSpeed * deltaTime;
        camera.position.x -= camSpeed * deltaTime;
    }
    
    if (IsKeyDown(KEY_W))
    {
        camera.target.z -= camSpeed * deltaTime;
        camera.position.z -= camSpeed * deltaTime;
    }

}
