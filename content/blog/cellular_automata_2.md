---
title: "Cellular Automata in WebGL: Part 2"
date: 2021-01-18T13:00:19-07:00
slug: ""
description: "Compact storage of multi-state rules"
keywords: []
draft: true
tags: []
math: false
toc: false
---

Last time I posted about cellular automata, I left off at a cliffhanger: how do we encode a multi-state rule compactly? Remember we're doing this in WebGL, so we need to store these in textures. The less space we use the better, but we also need to be wary of the cost of computing which pixel we need to check to determine the next state for each cell.

## Let's Start...

Let's start by thinking again about how we store Game of Life, and for that metter any two-state rule. We can think of Game of Life like a function, which takes as input the current state, and the total number of neighbors which are alive. Lets call dead state A and alive state B. 

To fully encode Game of Life, we need to know the output state O for every input:

![image of GoL table]()

This is simple enough! There are only N*(8+1) possible inputs, where N is the number of states. So to *fully encode* GoL, we only need to store 18 numbers.

So, on to the fun part. If we add a third state, we should get 3*(8+1) possible inputs, right? Well, no. In GoL our possible inputs of the two different states are simple, because there are only two. But remember the input neighbor state count has to always add up to 8! So with a third state, we won't see inputs like A=1,B=4,C=6, because it isn't possible to have 1+4+6=11 neighbors!

![oh no sum to 8!]()

## Defining Our Problem

So how do we store these if we can't just treat the space of all possible rules as a set of N-digit sequences? Well, let's think about the three-state example again:

![3-state table]()

> math shit

## Implementation

Ah, so you thought we were done! Not quite yet. We still have one big issue to resolve: computing the rule texture index within our fragment shader. This will be tricky because, remember, we need to compute a binomial coefficient multiple times for every pixel! Those have factorials in them! Not good!

Fear not, though, because a solution is at hand. We're only computing binomial coefficients for a fairly small set of $n$ and $k$, so we can just compute them once, then store the results, then retrieve them like this:

```GLSL
#version 300 es

uniform highp usampler2D uBinomial

// Returns binomial coefficient (n choose k) from precompute texture
int binomial(int n, int k) {
    return int(texelFetch(uBinomial, ivec2(n, k), 0).r);
}
```

Here we are using [`texelFetch()`](https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/texelFetch.xhtml) instead of [`texture()`](https://www.khronos.org/registry/OpenGL-Refpages/es3.0/html/texture.xhtml) to avoid having to use floating-point coordinates. It also allows us to not have to worry about the size of the texture.

To generate the texture:

```javascript
function buildBinomial() {
    const data = new Uint32Array(32 * 32);
    data.fill(0);
    for (let n = 0; n < 32; n++) {
        for (let k = 0; k < 32; k++) {
            data[k * 32 + n] = binomial(n, k);
        }
    }
    const binomialTex = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, binomialTex);
    // We use 32-bit unsigned integers because we need to store large numbers
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32UI, 32, 32, 0, this.gl.RED_INTEGER, this.gl.UNSIGNED_INT, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
}
```