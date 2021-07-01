---
title: "C++ Invert Map at Compile Time"
date: 2021-07-01T15:37:49-06:00
slug: "How to invert/reverse/transform a map at compile-time in C++!"
description: "How to invert/reverse/transform a map at compile-time in C++!"
keywords: ["C++", "unordered_map", "transform", "invert", "reverse", "map"]
draft: true
tags: ["C++"]
math: false
toc: false
---

Sometimes it's useful to be able to invert a map in C++ to perform reverse lookup. Say you are mapping names to IDs of something:

```C++
const std::unordered_map<std::string, int> stuffMap = {
    {"bread", 100},
    {"sword", 200},
    {"lamp",  300},
    {"clogs", 400}
};
```

Maybe you have the ID and want to get the name. That's something we can do by reversing the map.
Inserting the reversed pairs in a loop seems like a good solution, but maybe we also want this done at compile-time!
So let's define a function which does this for us, but with an arbitrary function, so we can do any
kind of transformation our hearts desire:

```C++
//Function which can transform an std::unordered_map of one type to another with a given transform function
template<typename Kout, typename Vout, typename Kin, typename Vin>
std::unordered_map<Kout, Vout> transformMap(
    const std::unordered_map<Kin, Vin>& inMap,
    const std::function<std::pair<Kout, Vout>(const std::pair<Kin, Vin>&)> mapfunc)
{
    std::unordered_map<Kout, Vout> outMap;
    std::for_each(inMap.begin(), inMap.end(),
        [&outMap, &mapfunc] (const std::pair<Kin, Vin> &p) {
            outMap.insert(mapfunc(p));
        }
    );
    return outMap;
}
```

We can use this function to reverse our `stuffMap` to allow reverse lookup, all at compile-time:

```C++
const std::unordered_map<int, std::string> revStuffMap = transformMap(stuffMap,
    std::function([](const std::pair<std::string, int>& p) {
        return std::make_pair(p.second, p.first);
    })
);
```

Let's try it out:

```C++
int main() {
    std::cout << "stuffMap:" << std::endl;
    for (const auto& p : stuffMap) {
        std::cout << p.first << ":" << p.second << std::endl;
    }
    std::cout << "\nrevStuffMap:" << std::endl;
    for (const auto& p : revStuffMap) {
        std::cout << p.first << ":" << p.second << std::endl;
    }
}
```
...
```
stuffMap:
400:clogs
300:lamp
200:sword
100:bread

revStuffMap:
bread:100
sword:200
clogs:400
lamp:300
```

And it doesn't need to stop at reversing a map! You can use any function to transform the input
to the output map. Go crazy!