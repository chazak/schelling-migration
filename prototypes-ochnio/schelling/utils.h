#pragma once 

#include "raylib.h"
#include "gametypes.h"

template <typename T, size_t R, size_t C>
using matrix = std::array<std::array<T, C>, R>;

inline bool ColorEqual(Color a, Color b)
{
    u32 ca = *(u32*)&a;
    u32 cb = *(u32*)&b;

    return ca == cb;
}


