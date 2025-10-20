#pragma once
#include "raylib.h"
#include "raymath.h"
#include "gametypes.h"

#include <cassert>
#include <math.h>

template<typename T>
struct V2
{
    T x, y = 0;

    inline static const V2<T> Up()      { return {0, 1};        }
    inline static const V2<T> Right()   { return {1, 0};        }
    inline static const V2<T> Down()    { return {0, -1};       }
    inline static const V2<T> Left()    { return {-1, 0};       }

};

template<typename T>
struct V3
{
    T x, y, z = 0;
};

inline
bool RayIntersectionPlane(Ray ray, Vector3 planeNormal, Vector3* outPosition)
{
    bool hit = false;

    float denom = Vector3DotProduct(planeNormal, ray.direction);
    if (fabs(denom) > 0.0001f)
    {
        float t = Vector3DotProduct(Vector3Subtract((Vector3){0,0,0}, ray.position), planeNormal) / denom;
        if (t >= 0)
        {
            *outPosition = Vector3Add(ray.position, Vector3Scale(ray.direction, t));
            hit = true;
        }
    }

    return hit;
}

