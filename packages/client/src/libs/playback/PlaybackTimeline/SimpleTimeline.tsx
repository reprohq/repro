import { Block, Row } from 'jsxstyle'
import React, { MutableRefObject, useEffect, useRef } from 'react'
import { fromEvent, NEVER, Observable, Subscription } from 'rxjs'
import {
  distinctUntilChanged,
  map,
  mapTo,
  startWith,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
} from 'rxjs/operators'
import { colors } from '@/config/theme'
import { usePlayback } from '../hooks'
import { PlaybackState } from '../types'
import { PlayAction } from './PlayAction'

interface Props {
  min?: number
  max?: number
}

export const SimpleTimeline: React.FC<Props> = ({ min, max }) => {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const playback = usePlayback()

  useEffect(() => {
    const subscription = new Subscription()
    const root = ref.current

    if (root) {
      const background = createBackgroundElement()
      const ghost = createGhostElement()
      const progress = createProgressElement()
      const tooltip = createTooltipElement()

      root.append(background, ghost, progress, tooltip)

      function getMinValue() {
        return min !== undefined ? min : 0
      }

      function getMaxValue() {
        return max !== undefined ? max : playback.getDuration()
      }

      function mapPointerEventToOffset(evt: PointerEvent) {
        const { x: rootOffsetX, width: rootWidth } =
          root.getBoundingClientRect()
        return Math.max(0, Math.min(1, (evt.clientX - rootOffsetX) / rootWidth))
      }

      function mapOffsetToValue(offset: number) {
        const minValue = getMinValue()
        const maxValue = getMaxValue()
        const value = minValue + (maxValue - minValue) * offset
        return Math.max(minValue, Math.min(maxValue, value))
      }

      function mapValueToOffset(value: number) {
        const minValue = getMinValue()
        const maxValue = getMaxValue()
        const offset = (value - minValue) / (maxValue - minValue)
        return Math.max(0, Math.min(1, offset))
      }

      // Direct events
      const pointerEnter$ = fromEvent<PointerEvent>(root, 'pointerenter')
      const pointerLeave$ = fromEvent<PointerEvent>(root, 'pointerleave')
      const pointerDown$ = fromEvent<PointerEvent>(root, 'pointerdown')

      // Indirect events
      const pointerMove$ = fromEvent<PointerEvent>(window, 'pointermove')
      const pointerUp$ = fromEvent<PointerEvent>(window, 'pointerup')

      subscription.add(
        pointerDown$
          .pipe(
            switchMapTo(pointerUp$.pipe(take(1))),
            map(mapPointerEventToOffset),
            map(mapOffsetToValue)
          )
          .subscribe(value => {
            playback.seekToTime(value)
          })
      )

      subscription.add(
        pointerEnter$
          .pipe(
            switchMapTo(pointerMove$.pipe(takeUntil(pointerLeave$))),
            map(evt => {
              const offset = mapPointerEventToOffset(evt)
              const value = mapOffsetToValue(offset)
              return [offset, value] as const
            })
          )
          .subscribe(([offset, value]) => {
            updateBarOffset(ghost, offset)
            updateTooltip(
              tooltip,
              offset,
              `-${Math.round(getMaxValue() - value)}ms`
            )
            showTooltip(tooltip)
          })
      )

      subscription.add(
        pointerLeave$.subscribe(() => {
          updateBarOffset(ghost, 0)
          hideTooltip(tooltip)
        })
      )

      subscription.add(
        pointerDown$
          .pipe(
            switchMap(() => {
              const playing =
                playback.getPlaybackState() === PlaybackState.Playing
              return pointerUp$.pipe(
                mapTo(playing),
                startWith(false),
                distinctUntilChanged()
              )
            })
          )
          .subscribe(playing => {
            if (playing) {
              playback.play()
            } else {
              playback.pause()
            }
          })
      )

      subscription.add(
        pointerDown$.pipe(map(mapPointerEventToOffset)).subscribe(offset => {
          updateBarOffset(progress, offset)
        })
      )

      subscription.add(
        pointerDown$
          .pipe(
            switchMapTo(pointerMove$.pipe(takeUntil(pointerUp$))),
            map(mapPointerEventToOffset)
          )
          .subscribe(offset => {
            updateBarOffset(progress, offset)
          })
      )

      subscription.add(
        playback.$playbackState
          .pipe(
            switchMap(playbackState => {
              const initialOffset = mapValueToOffset(playback.getElapsed())
              const duration = (1 - initialOffset) * getMaxValue()

              return playbackState === PlaybackState.Playing
                ? createAnimationObservable(progress, initialOffset, duration)
                : NEVER
            })
          )
          .subscribe(animation => animation.play())
      )

      subscription.add(
        playback.$latestControlFrame
          .pipe(
            map(() => playback.getElapsed()),
            map(mapValueToOffset)
          )
          .subscribe(offset => updateBarOffset(progress, offset))
      )
    }

    return () => {
      subscription.unsubscribe()

      if (root) {
        while (root.firstChild) {
          root.firstChild.remove()
        }
      }
    }
  }, [playback, ref, min, max])

  return (
    <Row alignItems="center" height="100%" gap={8}>
      <PlayAction />
      <Block
        position="relative"
        width="100%"
        height={8}
        hoverHeight={12}
        transition="height 100ms linear"
        props={{ ref }}
      />
    </Row>
  )
}

function createAnimationObservable(
  target: HTMLElement,
  initialOffset: number,
  duration: number
) {
  return new Observable<Animation>(observer => {
    console.log('animation', initialOffset, duration)
    const keyframes: Array<Keyframe> = [
      { transform: `scaleX(${initialOffset})` },
      { transform: `scaleX(1.0)` },
    ]

    const options: KeyframeEffectOptions = {
      duration,
      easing: 'linear',
      fill: 'forwards',
      iterations: 1,
    }

    const effect = new KeyframeEffect(target, keyframes, options)
    const animation = new Animation(effect)

    observer.next(animation)

    return () => {
      const completed = (animation.currentTime ?? 0) / duration
      const finalOffset = initialOffset + (1 - initialOffset) * completed
      updateBarOffset(target, finalOffset)
      animation.cancel()
    }
  })
}

function createBackgroundElement() {
  const elem = document.createElement('div')

  const styles = [
    ['backgroundColor', colors.slate['200'] as string],
    ['cursor', 'pointer'],
    ['height', '100%'],
    ['pointerEvents', 'none'],
    ['position', 'relative'],
    ['width', '100%'],
  ] as const

  for (const [key, value] of styles) {
    elem.style[key] = value
  }

  return elem
}

function createProgressElement() {
  const elem = document.createElement('div')

  const styles = [
    ['backgroundColor', colors.blue['500'] as string],
    ['height', '100%'],
    ['left', '0'],
    ['pointerEvents', 'none'],
    ['position', 'absolute'],
    ['top', '0'],
    ['transform', 'scaleX(0)'],
    ['transformOrigin', '0 0'],
    ['width', '100%'],
  ] as const

  for (const [key, value] of styles) {
    elem.style[key] = value
  }

  return elem
}

function createGhostElement() {
  const elem = document.createElement('div')

  const styles = [
    ['backgroundColor', colors.slate['300'] as string],
    ['height', '100%'],
    ['left', '0'],
    ['pointerEvents', 'none'],
    ['position', 'absolute'],
    ['transform', 'scaleX(0)'],
    ['transformOrigin', '0 0'],
    ['top', '0'],
    ['width', '100%'],
  ] as const

  for (const [key, value] of styles) {
    elem.style[key] = value
  }

  return elem
}

function createTooltipElement() {
  const elem = document.createElement('div')

  const styles = [
    ['backgroundColor', colors.slate['700'] as string],
    ['color', colors.white],
    ['display', 'none'],
    ['fontSize', '11px'],
    ['left', '0'],
    ['padding', '8px'],
    ['position', 'absolute'],
    ['top', '0'],
    ['transform', 'translate(-50%, -125%)'],
  ] as const

  for (const [key, value] of styles) {
    elem.style[key] = value
  }

  return elem
}

function updateBarOffset(target: HTMLElement, offset: number) {
  target.style.transform = `scaleX(${offset})`
}

function updateTooltip(target: HTMLElement, offset: number, value: string) {
  target.style.left = `${offset * 100}%`
  target.textContent = value
}

function showTooltip(target: HTMLElement) {
  target.style.display = 'block'
}

function hideTooltip(target: HTMLElement) {
  target.style.display = 'none'
}
