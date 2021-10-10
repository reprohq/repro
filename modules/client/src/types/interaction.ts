import { SyntheticId } from './common'

export enum InteractionType {
  ViewportResize = 'viewport-resize',
  Scroll = 'scroll',
  PointerMove = 'pointer-move',
  PointerDown = 'pointer-down',
  PointerUp = 'pointer-up',
  KeyDown = 'key-down',
  KeyUp = 'key-up',
}

export interface Sample<T> {
  value: T
  duration: number
}

export type Point = [number, number]

export interface ViewportResize {
  type: InteractionType.ViewportResize
  from: Point
  to: Sample<Point>
}

export interface Scroll {
  type: InteractionType.Scroll
  target: SyntheticId
  from: Point
  to: Sample<Point>
}

export interface PointerMove {
  type: InteractionType.PointerMove
  from: Point
  to: Sample<Point>
}

export interface PointerDown {
  type: InteractionType.PointerDown
  targets: Array<SyntheticId>
  at: Point
}

export interface PointerUp {
  type: InteractionType.PointerUp
  targets: Array<SyntheticId>
  at: Point
}

export interface KeyDown {
  type: InteractionType.KeyDown
  key: string
}

export interface KeyUp {
  type: InteractionType.KeyUp
  key: string
}

export type Interaction =
  | ViewportResize
  | Scroll
  | PointerMove
  | PointerDown
  | PointerUp
  | KeyDown
  | KeyUp
