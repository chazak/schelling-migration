#pragma once


#include <vector>
#include <cstdint>

#include "raylib.h"
#include "gametypes.h"
#include "aabb.h"
#include "math.h"
#include "resources.h"


typedef i64 InhabitantID;
constexpr InhabitantID InvalidId = -1;

struct InhabitantArchetype
{
    Color color;
};

struct Inhabitant
{
    InhabitantArchetype type;
    Vector3 position;
};

struct MovingInhabitant
{
    InhabitantID id = InvalidId;
    V2<i32> destination = {};
    V2<i32> origin = {};
};


struct InhabitantCell
{

    InhabitantID inhabitantId = InvalidId;
    bool reserved = false;

    inline bool IsEmpty() { return inhabitantId < 0
                                    && !reserved;}
};

struct InhabitantsSettings
{
    f32 gMaxInhabitants = 0.5f;
    f32 gIntoleranceFactor = 0.1f;
    size_t size = 64;

    std::vector<InhabitantArchetype> archetypes = {};
};

struct InhabitantSystem
{
    static constexpr f32 gMaxInhabitants = 0.5f;

    static constexpr f32 gIntoleranceFactor = 0.1f;

    V2<size_t> dimensions = {};
    std::vector<InhabitantCell> cells = {};
    std::vector<bool> reservations = {};

    std::vector<Inhabitant> inhabitants = {};


    f32 movementProgress = 0;
    std::vector<MovingInhabitant> movingInhabitants = {};

    u64 turnCount = 0;
    bool turnInProgress = false;

    // Functions
    static
    InhabitantSystem Create();

    void Populate();
    void Draw(AABB<i32> box, Resources* resources);
    void UpdateSchelling(int frameCount);

    f32 
    CalcCellScore ( Inhabitant* inhabitant,
                         V2<i32> position);
    f32 
    CalcNeighbourScore ( Inhabitant* inhabitant,
                         V2<i32> position);


    bool UpdateCellMovement(f32 dt);

    void StartNextTurn();

    void Update(f32 dt);

    inline
    InhabitantCell& CellAt(int x, int y)
    {
        return cells[(y * dimensions.x) + x];
    }

    inline
    bool GetReservationAt(int x, int y)
    {
        return reservations[(y * dimensions.x) + x];
    }

    inline
    void SetReservationAt(int x, int y, bool value)
    {
        reservations[(y * dimensions.x) + x] = value;
    }
};
