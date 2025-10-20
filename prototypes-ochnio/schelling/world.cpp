#include <cstdlib>
#include <cstdio>
#include <cstdint>

#include "raylib.h"
#include "world.h"
#include "gamesettings.h"

World World::Create()
{

    WorldSettings& settings = GameSettings::worldSettings;

    return {
        .dimensions = { (size_t)settings.size, 
                        (size_t)settings.size },

        .tiles = std::vector<GroundTile>(settings.size 
                                        * settings.size)
    };
};

void World::Randomize()
{
    WorldSettings& settings = GameSettings::worldSettings;

    for (int i = 0; i < settings.size; ++i)
    for (int j = 0; j < settings.size; ++j)
    {
        ETileTypes tileType = 
                            (ETileTypes)((int)rand() 
                            % (int)ETileTypes::Count);
        SetTile(i, j, { tileType });
    }
};


GroundTile& World::GetTile(int x, int y)
{ 
    return tiles[(y * dimensions.x) + x];
};


void World::SetTile(int x, int y, GroundTile tile)
{
    tiles[(y * dimensions.x) + x] = tile;
};






