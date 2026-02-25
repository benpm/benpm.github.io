---
title: "Petting Zoo"
date: 2020-01-11T11:11:17-06:00
draft: false
hideheader: true
category: "machine learning"
description: "Machine learning game environment with genetic algorithm"
outlink: "https://github.com/TheFutureGadgetsLab/pettingzoo"
img: "/images/petting_zoo.png"
---

Petting Zoo is a framework for training neural network agents to play a procedurally generated Mario-style platformer using genetic algorithms. Supervised learning doesn't apply well to games — there's no predetermined "correct" input — so agents evolve through natural selection: they play levels, receive fitness scores, and successful models breed to produce improved generations.

The game environment generates endless level variety (gaps, spike platforms, changing floor heights) to prevent overfitting, while agents use feed-forward neural networks that map player vision inputs directly to button outputs.

![Petting Zoo level](https://github.com/TheFutureGadgetsLab/PettingZoo/raw/master/img/LevelScreeny.png)
