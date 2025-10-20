#pragma once

#include <vector>
#include "math.h"


enum class ETileTypes
{
    Sand = 0,
    Water, 
    Stone, 
    Forest,
    Count
};

struct GroundTile
{
    ETileTypes tileType = ETileTypes::Sand;
};

struct WorldSettings
{
    int size;
};

struct World
{
    V2<size_t> dimensions;
    std::vector<GroundTile> tiles;

    static World Create();

    void Randomize();

    size_t Index(int x, int y);
                    
    GroundTile& GetTile(int x, int y);

    void SetTile(int x, int y, GroundTile tile);
};
