# CUDA and OpenGL Raytracer
A simple raytracer using CUDA, with OpenGL for drawing. Adapted from ["Accelerated Ray Tracer in One Weekend in CUDA"](https://devblogs.nvidia.com/accelerated-ray-tracing-cuda/)
![Screenshot](https://github.com/benpm/cuda-raytracer/blob/master/screenshot.png)


## Features
- Diffuse lighting
- Matte material, metallic (reflective) material, dielectric (refractive) material
- Planes and spheres

## Dependencies
- CUDA 10
- OpenGL 4
- glm
- GLFW 3
- glew
- CMake

## Building and Running
*Tested on Ubuntu 19.10*

Code hosted at [https://github.com/benpm/cuda-raytracer](https://github.com/benpm/cuda-raytracer)

1. Install dependencies: `nvidia-cuda-toolkit libglm-dev libglfw3-dev libglew-dev cmake`
2. `mkdir build && cd build`
3. `cmake ..`
4. `make`
5. `./main`