---
title: "CUDA Raytracer"
date: 2020-07-25T11:11:17-06:00
draft: false
hideheader: true
category: "graphics"
description: "Simple parallel raytracer on the GPU with CUDA C++"
outlink: "https://github.com/benpm/cuda-raytracer"
img: "/images/cuda_raytracer.png"
---

A parallel raytracer built with CUDA and OpenGL, adapted from NVIDIA's "Ray Tracing in One Weekend in CUDA" tutorial. The raytracing kernel runs entirely on the GPU, with OpenGL handling final display output.

The implementation supports diffuse, metallic (reflective), and dielectric (refractive) material types, along with plane and sphere primitives. Built and tested on Ubuntu with CUDA 10 and OpenGL 4.

![Raytracer output](https://github.com/benpm/cuda-raytracer/raw/master/screenshot.png)
