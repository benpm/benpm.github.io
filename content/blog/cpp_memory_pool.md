---
title: "Simple, thread-safe C++ memory pool"
date: 2021-11-28
slug: "How to make a dead simple, thread-safe memory pool / arena in C++ that supports multiple types and smart pointers"
description: "How to make a dead simple, thread-safe memory pool / memory arena in C++ that supports multiple types and smart pointers"
keywords: ["C++", "memory pool", "shared_ptr", "memory arena", "thread safe"]
draft: true
tags: ["C++"]
math: false
toc: false
---

Memory pools, by pre-allocating large chunks of memory before it's actually used for something, can reduce the number of expensive memory allocations. Here I present a simple, thread-safe memory pool that supports arbitrary types and smart pointers. It is not the most generally useful case, but it is very simple and easy to use.

The code can be found [here](https://github.com/benpm/cppmempool).

## How it Works

It works like this: **chunks** of memory (default is 8kB) are allocated together, 32 at a time. These are called **blocks**.

<!-- a block of chunks being allocated -->

Each chunk has a pointer, `next`, to the next chunk in the block. The last chunk in the block points to the first chunk in the next block.

<!-- pointing chunks -->

When the user requests to allocate an object, it is initialized in the current chunk. If there's not enough space to fit our object, we just follow the pointer to the next chunk, which then becomes our new current chunk.

<!-- filled chunk, following pointer -->

We achieve this by keeping track of the number of bytes allocated in the chunk. We also decrement this counter when we want to de-allocate an object from the pool. If the byte counter reaches zero, we know the entire chunk is empty and we can re-use it. We achieve this by setting the `next` of the current chunk to point to the newly empty chunk, and the newly empty chunk to point to the old `next` of the current chunk.

<!-- inserting the newly empty chunk into the linked list -->



It's not particularly memory efficient and has very definite limitations:
- If old objects are typically not systematically destroyed, this pool will just keep allocating more blocks of memory. This is becase
- It does not use any kind of memory alignment aside from using acceptably sensible power-of-2 sizes for things

\> TODO benchmarks

\> TODO drawings / explanation