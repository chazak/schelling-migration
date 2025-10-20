#include "gamesettings.h"

WorldSettings GameSettings::worldSettings = {};
InhabitantsSettings GameSettings::inhabitantSettings = {};

void GameSettings::Init()
{
    GameSettings::worldSettings =
    { 
        .size = 64
    };

    GameSettings::inhabitantSettings = 
    {
        .gMaxInhabitants = 0.5f,
        .gIntoleranceFactor = 0.1f,
        .archetypes = 
        {
            { RED },
            { BLUE },
            { GREEN },
            { YELLOW },
            { PURPLE },
        }
    };

}
