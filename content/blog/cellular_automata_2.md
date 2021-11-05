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

## Defining Our Problem

So how do we store these if we can't just treat the space of all possible rules as a set of N-digit sequences? Well, let's think about the three-state example again:

![3-state table]()

