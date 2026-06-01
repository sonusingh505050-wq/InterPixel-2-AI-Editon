cmake_minimum_required(VERSION 3.20)
project(InterPixelOS2Native C CXX)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(ipx_kernel OBJECT kernel.c)
add_executable(ipx_v8_host v8_host.cpp)

option(INTERPIXEL_WITH_V8 "Compile with V8 support" OFF)
if (INTERPIXEL_WITH_V8)
  target_compile_definitions(ipx_v8_host PRIVATE INTERPIXEL_WITH_V8=1)
endif()
