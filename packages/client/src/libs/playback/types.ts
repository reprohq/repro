import { Snapshot, SourceEvent, SourceEventType } from '@/types/recording'
import { LazyList } from '@/utils/lang'
import { Atom } from '@/utils/state'

export enum PlaybackState {
  Playing,
  Paused,
}

export enum ControlFrame {
  Idle,
  SeekToEvent,
  SeekToTime,
}

export interface Playback {
  // Atoms
  readonly $activeIndex: Atom<number>
  readonly $buffer: Atom<Array<SourceEvent>>
  readonly $elapsed: Atom<number>
  readonly $latestControlFrame: Atom<ControlFrame>
  readonly $playbackState: Atom<PlaybackState>
  readonly $snapshot: Atom<Snapshot>

  // Accessors
  getActiveIndex(): number
  getBuffer(): Array<SourceEvent>
  getDuration(): number
  getElapsed(): number
  getEventTimeAtIndex(index: number): number | null
  getEventTypeAtIndex(index: number): SourceEventType | null
  getLatestControlFrame(): ControlFrame
  getPlaybackState(): PlaybackState
  getSnapshot(): Snapshot
  getSourceEvents(): LazyList<SourceEvent>

  // Controls
  play(): void
  pause(): void
  seekToEvent(index: number): void
  seekToTime(time: number): void

  // Lifecycle
  open(): void
  close(): void

  // Operations
  copy(): Playback
}

export type ReadyState = 'waiting' | 'ready' | 'failed'

export interface Source {
  $events: Atom<LazyList<SourceEvent>>
  $readyState: Atom<ReadyState>
}
