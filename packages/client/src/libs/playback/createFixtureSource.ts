import { SourceEvent } from '@/types/recording'
import { createAtom } from '@/utils/state'
import { LazyList } from '@/utils/lang'
import { ReadyState, Source } from './types'
import { SourceEventView } from '../codecs/event'

export function createFixtureSource(name: string): Source {
  const request: Promise<Array<SourceEvent>> = fetch(
    `/fixtures/${name}.json`
  ).then(res => res.json())

  const [$events, _getEvents, setEvents] = createAtom(
    LazyList.Empty<SourceEvent>()
  )

  const [$readyState, _getReadyState, setReadyState] =
    createAtom<ReadyState>('waiting')

  request.then(events => {
    setEvents(
      new LazyList(
        events.map(SourceEventView.encode),
        SourceEventView.decode,
        SourceEventView.encode
      )
    )
    setReadyState('ready')
  })

  request.catch(() => {
    setReadyState('failed')
  })

  return {
    $readyState,
    $events,
  }
}
