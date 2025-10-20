#include "worldrendering.h"

void WorldDrawSystem::DrawWorld( World* world, AABB<i32> cullingBox)
{

    for (int i = cullingBox.xMin; i < cullingBox.xMax; ++i)
    for (int j = cullingBox.yMin; j < cullingBox.yMax; ++j)
    {

        if ( (i == cellHighlight.x) && 
             (j == cellHighlight.y) )
        {
            DrawPlane( {(float)i, 0,  (float)j}, // Pos
                       {1, 1},                 // Size 
                       BLACK);                   // Color
            continue;
        }

        ETileTypes tileType = world->GetTile(i, j).tileType;
        Vector3 position = {(float)i, 0,  (float)j};
        Color color = tileColors[(int)tileType];

        DrawPlane( position,// Pos
                    {1, 1}, // Size 
                    color); // Color
                            
                    
    }
}

void WorldDrawSystem::HighlightCellAtPosition(V2<i32> position)
{
    cellHighlight = position;
}

void WorldDrawSystem::ResetHighlight()
{
    cellHighlight = { i32Min, i32Min };
}

