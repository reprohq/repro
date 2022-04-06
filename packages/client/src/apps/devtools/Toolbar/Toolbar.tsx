import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { Tooltip } from '@/components/Tooltip'
import { colors } from '@/config/theme'
import { PlaybackTimeline, usePlayback } from '@/libs/playback'
import { Block, InlineBlock, Row } from 'jsxstyle'
import React, { useCallback } from 'react'
import { Code as InspectorIcon } from 'react-feather'
import { ExporterButton } from '../Exporter'
import { useInspecting, useExporting } from '../hooks'
import { Picker } from './Picker'
import { Tabs } from './Tabs'

interface Props {
  disableExport?: boolean
  disableToggle?: boolean
  hideLogo?: boolean
}

export const Toolbar: React.FC<Props> = ({
  disableExport,
  disableToggle,
  hideLogo,
}) => {
  const playback = usePlayback()
  const [inspecting, setInspecting] = useInspecting()
  const [, setExporting] = useExporting()

  const toggleInspector = useCallback(() => {
    setInspecting(inspecting => !inspecting)
  }, [setInspecting])

  const openExporter = useCallback(() => {
    playback.pause()
    setExporting(true)
  }, [playback, setExporting])

  return (
    <Container>
      {!hideLogo && (
        <Row
          alignItems="center"
          paddingH={10}
          cursor={!disableToggle ? 'pointer' : 'default'}
          props={{ onClick: !disableToggle ? toggleInspector : undefined }}
        >
          <Logo size={20} />
        </Row>
      )}

      {!inspecting && (
        <React.Fragment>
          {!disableToggle && (
            <Block position="relative" alignSelf="center" marginRight={8}>
              <Button
                variant="secondary"
                size="small"
                onClick={toggleInspector}
              >
                <InspectorIcon size={16} />
                <InlineBlock>Open Inspector</InlineBlock>
              </Button>
              <Tooltip>Ctrl+Shift+I</Tooltip>
            </Block>
          )}
        </React.Fragment>
      )}

      {inspecting && (
        <React.Fragment>
          <Separator />
          <Picker />
          <Separator />
          <Tabs />
          <Separator />
          <TimelineRegion>
            <PlaybackTimeline.Simple
              min={Math.max(0, playback.getDuration() - 30_000)}
              max={playback.getDuration()}
            />
          </TimelineRegion>
          {!disableExport && (
            <Block alignSelf="center" marginLeft="auto" marginRight={16}>
              <ExporterButton onClick={openExporter} />
            </Block>
          )}
        </React.Fragment>
      )}
    </Container>
  )
}

const Container: React.FC = ({ children }) => (
  <Row alignItems="stretch">{children}</Row>
)

const Separator: React.FC = () => (
  <Block
    alignSelf="center"
    backgroundColor={colors.slate['200']}
    height="calc(100% - 20px)"
    width={1}
  />
)

const TimelineRegion: React.FC = ({ children }) => (
  <Block flex={1} marginV={10} marginH={16}>
    {children}
  </Block>
)
