---
title: "C++ thread-safe smart pointer memory pool in 100 lines"
date: 2021-11-28
slug: "How to make a dead simple, thread-safe memory pool / memory arena in C++ that supports multiple types and smart pointers"
description: "How to make a dead simple, thread-safe memory pool / memory arena in C++ that supports multiple types and smart pointers"
keywords: ["C++", "memory pool", "shared_ptr", "memory arena", "thread safe"]
draft: true
tags: ["C++"]
math: false
toc: false
---

```C++
#pragma once

#include <stdlib.h>
#include <memory>
#include <mutex>

class Pool {
  private: // -----------------------------------------------------------

  struct Chunk {
    static constexpr size_t size = 4096;
    // Next free byte in chunk
    uint8_t* head = nullptr;
    // Next free chunk
    Chunk* next = nullptr;
    // Occupied bytes in chunk
    size_t used;

    // Initialize chunk
    void init(Chunk* next) {
      this->next = next;
      this->used = sizeof(Chunk);
      this->head = ((uint8_t*)this) + sizeof(Chunk);
    }
    // Returns if chunk is empty
    bool empty() const {
      return used == sizeof(Chunk);
    }
    // Emplace object of type T in chunk
    template<class T, class... V>
    std::shared_ptr<T> emplace(Pool* pool, V&&... v) {
      static_assert(sizeof(T) <= size - sizeof(Chunk),
        "Object is too large for chunk");
      T* obj = new (head) T(std::forward<V>(v)...);
      head += sizeof(T);
      used += sizeof(T);
      return std::shared_ptr<T>(obj, [this, pool](T* obj) {
        this->used -= sizeof(T);
        obj->~T();
        if (this->empty()) {
          std::lock_guard<std::mutex> lock(pool->mutex);
          // Now when I'm full, curChunk will be set to
          //  the previous non-full chunk
          this->next = pool->curChunk;
          // I am now the current chunk to allocate to
          pool->curChunk = this;

          /* 
          // This will also work - prefer to fill up 
          //  current chunk before me
          this->next = pool->curChunk->next;
          pool->curChunk->next = this;
           */
        }
      });
    }
  };

  // Number of chunks in each block of chunks
  static constexpr size_t chunksPerBlock = 32;
  // Size of a block in bytes
  static constexpr size_t blockSize = Chunk::size * chunksPerBlock;

  // Non-full chunk which we are currently allocating objects in
  Chunk* curChunk = nullptr;
  // Pointer to first chunk in initial block
  Chunk* initBlock = nullptr;
  // Used to ensure thread safety
  std::mutex mutex;

  // Allocates a new block of chunks
  Chunk* allocBlock() {
    Chunk* block = reinterpret_cast<Chunk*>(malloc(blockSize));
    Chunk* chunk = block;
    for (size_t i = 0; i < chunksPerBlock - 1; i++) {
      chunk->init(reinterpret_cast<Chunk*>(
        reinterpret_cast<uint8_t*>(chunk) + Chunk::size));
      chunk = chunk->next;
    }
    chunk->init(nullptr);
    if (curChunk) {
      curChunk->next = block;
    }
    curChunk = block;
    return block;
  }

  public: // -----------------------------------------------------------

  Pool() {
    initBlock = allocBlock();
  }

  ~Pool() {
    std::lock_guard<std::mutex> lock(mutex);

    // Free all blocks sequentially starting with first allocated
    Chunk* block = initBlock;
    do {
      Chunk* next = block[chunksPerBlock - 1].next;
      free(block);
      block = next;
    } while (block != nullptr);
    curChunk = nullptr;
  }

  // Create new object in pool
  template<class T, class... V>
  std::shared_ptr<T> emplace(V&&... v) {
    std::lock_guard<std::mutex> lock(mutex);
    if (curChunk->head + sizeof(T) > (uint8_t*)curChunk + Chunk::size) {
      // Object won't fit in current chunk...
      if (curChunk->next == nullptr) {
        // Current chunk
        allocBlock();
      } else {
        curChunk = curChunk->next;
      }
    }
    return curChunk->emplace<T>(this, std::forward<V>(v)...);
  }
};
```

\> TODO benchmarks

\> TODO drawings / explanation