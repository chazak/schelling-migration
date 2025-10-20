#include "inhabitant.h"

#include <algorithm>
#include <limits>
#include <vector>
#include <cassert>

#include "raylib.h"
#include "raymath.h"


#include "gamesettings.h"

InhabitantSystem 
InhabitantSystem::Create()
{
    InhabitantsSettings& iSettings =
                         GameSettings::inhabitantSettings;


    return {
        .dimensions = { (size_t)iSettings.size, 
                         (size_t)iSettings.size },

        .cells = std::vector<InhabitantCell>(iSettings.size * iSettings.size),
                 

        .reservations = std::vector<bool>(iSettings.size * iSettings.size, false),
    };
}

void InhabitantSystem::StartNextTurn()
{
    if (turnInProgress)
    {
        return;
    }

    turnCount++;
    movementProgress = 0;
    UpdateSchelling(turnCount);
    turnInProgress = true;
}

bool InhabitantSystem::UpdateCellMovement(f32 dt)
{
    if (!turnInProgress)
    {
        return true;
    }

    movementProgress += dt;
    movementProgress = std::clamp<f32>(movementProgress, 0.0f, 1.0f);

    for (int i = 0; i < movingInhabitants.size(); i++)
    {
        MovingInhabitant moving = movingInhabitants[i];

        InhabitantID id = moving.id;

        V2<i32> cOrigin = moving.origin;
        V2<i32> cDest = moving.destination;

        Vector3 origin = {(float)cOrigin.x, 0, (float)cOrigin.y};
        Vector3 destination = {(float)cDest.x, 0, (float)cDest.y};

        if (movementProgress < 1.0f)
        {
            Vector3 pos = Vector3Lerp(origin,
                    destination,
                    movementProgress);

            inhabitants[id].position = pos;
        }
        else
        {
            inhabitants[id].position = destination;

            CellAt(cOrigin.x,cOrigin.y).inhabitantId = InvalidId;
            CellAt(cDest.x, cDest.y).inhabitantId = id;

        }
        
    }

    if (movementProgress >= 1.0f)
    {
        turnInProgress = false;
        movingInhabitants.clear();
        return true;
    }

    return false;
}



f32
InhabitantSystem::CalcNeighbourScore ( Inhabitant* inhabitant,
                                           V2<i32> position)
{
    assert(inhabitant);

    InhabitantsSettings& iSettings =
                         GameSettings::inhabitantSettings;

    if (position.x < 0 || position.x >= iSettings.size)
    {
        return 0;
    }

    if (position.y < 0 || position.y >= iSettings.size)
    {
        return 0;
    }

    InhabitantCell cell = CellAt(position.x, position.y);

    if (!cell.IsEmpty())
    {

        V2<i32> inhabPosition = {(i32)inhabitant->position.x,
                                (i32)inhabitant->position.z};

        if (inhabPosition.x == position.x
                && inhabPosition.y == position.y)
        {
            //return 0.0;
        }

        Color inhabC = inhabitant->type.color;

        Inhabitant inhabN = inhabitants[cell.inhabitantId];
        Color neighC = inhabN.type.color;

        bool same = ColorIsEqual(inhabC, neighC);
        if (!same)
        {
            return -gIntoleranceFactor;
        }
        else 
        {
            return gIntoleranceFactor;
        }

    }
    else
    {
        return 0.0f;
    }
}


f32
InhabitantSystem::CalcCellScore ( Inhabitant* inhabitant,
                                       V2<i32> position)
{
    InhabitantsSettings& iSettings =
                         GameSettings::inhabitantSettings;

    i32 x = position.x;
    i32 y = position.y;

    f32 totalScore = 0.0f;

    constexpr size_t dirCount = 4; 
    V2<i32> adjascentScores[dirCount] = 
    {
        { V2<i32>::Up()},
        { V2<i32>::Down() },
        { V2<i32>::Right() },
        { V2<i32>::Left() },
    };


    for (int i = 0; i < 4; i++)
    {
        V2<i32> nextPos = { x + adjascentScores[i].x,
                            y + adjascentScores[i].y
        };
        
        if (( nextPos.x < 0 || nextPos.x >= iSettings.size)
            && (nextPos.y < 0 || nextPos.y >= iSettings.size))
        {
            continue;
        }
        
        totalScore = CalcNeighbourScore(inhabitant,
                                        nextPos);
    }

    return totalScore;
}


struct SchellingScoreData
{
    V2<i32> direction;
    f32 score;
};

void InhabitantSystem::UpdateSchelling(int frameCount)
{

    InhabitantsSettings& iSettings =
                         GameSettings::inhabitantSettings;
    // Zero rezervations
    reservations.assign(reservations.size(), false);

    for (int x = 0; x < iSettings.size; x++)
    for (int y = 0; y < iSettings.size; y++)
    {
        InhabitantCell cell = CellAt(x, y);
        // None there let's continue
        if (cell.IsEmpty())
        {
            continue;
        }



        constexpr i16 dirCount = 4; 
        // Left, Right, Down, Up
        SchellingScoreData scores[dirCount] = 
        {
            { V2<i32>::Up(),    0},
            { V2<i32>::Down(),  0},
            { V2<i32>::Right(), 0},
            { V2<i32>::Left(),  0},
        };

        Inhabitant* currentInhab = &inhabitants[cell.inhabitantId];

        for (int i = 0; i < dirCount; i++)
        {
            V2<i32> nextPos = { x + scores[i].direction.x,
                                y + scores[i].direction.y
            };
            
            if (( nextPos.x < 0 || nextPos.x >= iSettings.size)
                || (nextPos.y < 0 || nextPos.y >= iSettings.size))
            {
                scores[i].score = f32Min;
                continue;
            }

            if (!CellAt(nextPos.x, nextPos.y).IsEmpty()
                    || GetReservationAt(nextPos.x, nextPos.y))
            {
                scores[i].score = f32Min;
                continue;
            }

            scores[i].score = CalcCellScore(currentInhab,
                                                    nextPos);
        }

        // Sort the results
        std::sort(std::begin(scores), std::end(scores),
                [](auto& A, auto&B) {return A.score < B.score;});

        f32 currentScore = CalcCellScore(currentInhab, {x, y});
        i32 moveDir = -1;

        for (int i = 0; i < dirCount; i++)
        {

            float nScore = scores[i].score;
            if (nScore == f32Min) 
            {
                // Can't move to min float
                break;
            }
            else if (currentScore > nScore)
            {
                break;
            }
            else if (nScore == currentScore)
            {
                if (rand() % 2 > 0)
                {
                    moveDir = i;
                }
                else
                {
                    break;
                }
            }
            else if (currentScore < nScore)
            {
                moveDir = i;
            }
        }


        // If we have direction
        if (moveDir >= 0)
        {
            V2<i32> direction = scores[moveDir].direction;
            V2<i32> nextPos = {x + direction.x, y + direction.y};

            InhabitantID id = cell.inhabitantId;

            Inhabitant in = inhabitants[id];
            V2<i32> iPos = {(i32)std::round(in.position.x),
                            (i32)std::round(in.position.z)};
            V2<i32> oPos = {x, y};

            assert(iPos.x == oPos.x && iPos.y == iPos.y);

            assert(CellAt(nextPos.x, nextPos.y).IsEmpty());

            movingInhabitants.push_back({.id = id,
                                            .destination = nextPos,
                                            .origin = {x, y}});

            SetReservationAt(nextPos.x, nextPos.y, true);
        }

    }  // End cell iteration


    // Sanity check
    for (int i = 0; i < movingInhabitants.size(); i++)
    {
        MovingInhabitant mv = movingInhabitants[i];
        Inhabitant in = inhabitants[mv.id];
        V2<i32> oPos = mv.origin;
        V2<i32> iPos = {(i32)in.position.x, (i32)in.position.z};

        assert (oPos.x == iPos.x);
        assert (oPos.y == iPos.y);
    }


};

void InhabitantSystem::Draw(AABB<i32> box, Resources* r)
{
    Model m = r->models["InhabitantToken"];

    for (int i = box.xMin; i < box.xMax; ++i)
    for (int j = box.yMin; j < box.yMax; ++j)
    {
        InhabitantCell cell = CellAt(i,j);

        if (cell.IsEmpty())
        {
            continue;
        }

        Inhabitant inh = inhabitants[cell.inhabitantId];

        Vector3 drawPos = {inh.position.x,  0.1f, inh.position.z};

        DrawModel(m, drawPos, 1.0f, inh.type.color);
    }
}


void InhabitantSystem::Populate()
{
    InhabitantsSettings& iSettings =
                         GameSettings::inhabitantSettings;

    int max = iSettings.size * iSettings.size * gMaxInhabitants;
    for (int i = 0; i < max; ++i)
    {

        do
        {
            int posX = rand() % iSettings.size;
            int posY = rand() % iSettings.size;


            InhabitantCell existingInhabitant = CellAt(posX, posY);

            if (!existingInhabitant.IsEmpty())
            {
                continue;
            }
            else
            {
                //printf("Creating inhabitant %i at %u %u\n",
                        //i, posX, posY);

                int maxTypes = iSettings.archetypes.size();
                int iType = rand() % maxTypes;
                InhabitantArchetype type = iSettings.archetypes[iType];

                Inhabitant inhab = {
                            .type = type,
                            .position = {(f32)posX, 0.0, (f32)posY}
                };

                V2<i32> iPos = {(i32)inhab.position.x, (i32)inhab.position.z};
                V2<i32> oPos = {posX, posY};


                assert(iPos.x == oPos.x && iPos.y == iPos.y);

                InhabitantID id = inhabitants.size();
                inhabitants.push_back(inhab);
                    


                InhabitantCell newCell {};
                newCell = { .inhabitantId = id};

                CellAt(posX, posY) = newCell;

                break;
            }
        }
        while (true);

        // Sanity Check

        for (int x = 0; x < iSettings.size; x++)
        for (int y = 0; y < iSettings.size; y++)
        {
            InhabitantCell cell = CellAt(x, y);
            if (cell.IsEmpty())
            {
                continue;
            }

            Inhabitant in = inhabitants[cell.inhabitantId];
            V2<i32> oPos = {x, y};
            V2<i32> iPos = {(i32)in.position.x, (i32)in.position.z};

            assert (oPos.x == iPos.x);
            assert (oPos.y == iPos.y);

        }

    }
}
