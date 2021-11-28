---
title: "Rectangle (AABB) Collisions"
date: 2020-07-22T22:10:40-06:00
slug: "2D top-down collisions with rectangles (AABBs)"
description: "Simulating simple 2D game physics with axis-aligned bounding boxes"
keywords: ["AABB", "2d", "collisions", "physics", "game physics"]
draft: false
tags: ["math", "tiletest", "gamedev", "game-physics"]
math: false
toc: false
---

Axis-aligned bounding boxes (AABBs) are very useful for doing simple collision detection and 2D physics. 
The basic idea is: loop through the boxes, checking for intersections with each other box. Then, you resolve
these intersections by moving the boxes in the direction of the shortest intersection axis. So if the width
of the intersection is smaller than its height, like it is here, then the boxes are moved on the x axis:

{{< drawing "/images/aabb/boxes.png" >}}

I will be using these types of collisions for the game I am developing. The game is top-down. It looks like this:

![](/images/2020-07-22_23-41.png)

So the physics doesn't actually need to have fancy features like bounce (restitution). What it does need is
to be stable and fast.

There are a couple things I'll need to do to acheive both of these goals. First, I'll need to make it stable. Without any modifications, the simple collision algorithm creates far too much jiggliness, especially when there are a lot of boxes pushing on each other all at once. This happens because during a collision pass, a box may be pushed by a collision into another box, causing an intersection. However, this intersection won't be resolved until the next pass.

{{< drawing "/images/aabb/boxes2.png" >}}

In order to solve this issue, I've decided to run multiple passes of collision resolution on the boxes before each
update step. The update step is where velocity is applied to position, friction is applied, etc.
Here is the result of using multiple passes:

{{< codepen xxZMjXb >}}

As you can see, there are still some minor issues. When a constant force is applied, the boxes vibrate slightly. Also, when there is a big pile, they tend to overlap. It's also pretty slow, since each box needs to check against each other box each collision pass, and there are multiple collision passes now.

To solve this issue with speed, I'll probably end up using [quadtrees](https://www.wikiwand.com/en/Quadtree) for neighbor lookup, but that's for another time!
