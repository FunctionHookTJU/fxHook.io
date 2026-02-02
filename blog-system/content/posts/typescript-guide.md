---
title: "TypeScript 入门教程"
date: "2025-01-05"
tags: ["TypeScript", "JavaScript", "编程"]
description: "从零开始学习 TypeScript 的完整指南"
cover: ""
---

# TypeScript 入门教程

TypeScript 是 JavaScript 的超集，添加了静态类型检查和其他特性。

## 基础类型

```typescript
// 基本类型
let name: string = 'TypeScript'
let age: number = 10
let isActive: boolean = true

// 数组
let numbers: number[] = [1, 2, 3]
let strings: Array<string> = ['a', 'b', 'c']

// 对象
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}
```

## 函数类型

```typescript
function add(a: number, b: number): number {
  return a + b
}

// 箭头函数
const multiply = (a: number, b: number): number => a * b
```

## 类和接口

```typescript
interface Animal {
  name: string
  makeSound(): void
}

class Dog implements Animal {
  name: string

  constructor(name: string) {
    this.name = name
  }

  makeSound() {
    console.log('Woof!')
  }
}
```

## 泛型

```typescript
function identity<T>(arg: T): T {
  return arg
}

const num = identity<number>(42)
const str = identity<string>('Hello')
```

## 总结

TypeScript 提供了强大的类型系统，可以帮助我们在开发阶段发现错误，提高代码质量。
