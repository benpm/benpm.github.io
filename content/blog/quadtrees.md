---
title: "Quadtrees for 2D Games with Moving Elements"
date: 2020-09-20T10:41:59-06:00
slug: "quadtrees"
description: "How to use quadtrees for 2D top-down collisions, search, when the elements are constantly in motion"
keywords: ["quadtree", "game physics", "top-down", "spatial hashing", "search", "tiletest"]
draft: false
tags: ["tiletest", "gamedev"]
math: false
toc: false
---

A quadtree is a very useful data structure for performing spatial searches. I am currently using them in [Tiletest](/gamedev/#tiletest) for collision detection and monster behavior. Quadtrees partition 2D space into quadrants (stored as nodes in a tree), dividing these quadrants into smaller quadrants when they contain more than a certain threshold of elements (shown as dots):

![Quadrant division](/images/quadtrees/quadrant_division.png)

There are a couple uses for this structure, one of the most useful is searching for the nearest element to a given location.

## Nearest Element to Chosen Location

To find the nearest element to a chosen location, there are [many algorithms out there](https://stackoverflow.com/a/32412425/2909339). I went with a simple yet efficient one, a breadth-first search with quadrant exclusion. First, we look through each leaf node at the highest level of the tree, keeping track of the closest element we've found so far. Then, we check the next level of the tree, and so on. The exclusion part is just skipping our search of nodes that cannot contain a closer element than the closest we've found so far. Here's a simple example:

![Exclusion of nodes based on signed distance](/images/quadtrees/quadrant_exclusion.png)

To do this, we calculate the smallest distance (shown as blue lines) from our search location (the blue dot) to a node's rectangular boundary. This gives us the shortest distance an element of this node could possibly have. If that shortest distance is farther than the nearest element so far (red dot), we don't search it *or* its children (excluded nodes are shown in grey).

This works fairly well on its own, but to make it more efficient, we will also try to search the closest nodes first. This avoids extra data structure accesses by excluding nodes as early as possible.

Here you can see this algorithm in action:

{{< codepen ExPBMrW >}}

This is just a static set of elements, though. Things get a little tricky when the elements are constantly moving.

## Dealing With Moving Elements / Relocation

The naive solution to moving elements is to walk through the whole tree, checking if each element's position is truly within the bounds of its current parent node, reinserting those that have do not pass the check.

This solution can be improved, as it needs to traverse the whole tree in order to perform relocation. Instead, let's have the elements themselves keep track of which node they are children of. This way, we can check that they are within bounds without traversing the tree. If an element has moved outside its bounds, then we reinsert it.

Another optimization involves not worrying about leftover empty leaf nodes. Checking if the parent node we just removed from is easy enough, but sometimes if we remove an element from the last populated node of its siblings, the parent node won't get removed. To solve this we can either check all ancestors of a node each time we remove an element (expensive), or we can worry about it later (the lazy, cheap choice, better when lots of elements are moving constantly).

In Tiletest, this has led to a huge performance improvement as many entities need information about their neighbors every tick. Here you can see slimes grouping together, which is done by finding the nearest slime and moving away from it each tick:

![tiletest](/images/quadtrees/2020-10-20_20-21.png)

More updates on the game later!

