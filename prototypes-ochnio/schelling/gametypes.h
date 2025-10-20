#pragma once
#include <limits>
#include <cstdint>

// Floats
using f32 = float;
static_assert((sizeof(f32) == 4) 
              && "platform does not have 32b float!");

using f16 = short;
static_assert((sizeof(f16) == 2) 
              && "platform does not have 16b float!");



constexpr float f32Min = std::numeric_limits<f32>::min();
// Floats End


// Ints

constexpr int32_t i32Min = std::numeric_limits<int32_t>::min();
constexpr int32_t i32Max = std::numeric_limits<int32_t>::max();

using u16 = uint16_t;
using i16 = int16_t;
using u32 = uint32_t;
using i32 = int32_t;
using u64 = uint64_t;
using i64 = int64_t;
// Ints End
