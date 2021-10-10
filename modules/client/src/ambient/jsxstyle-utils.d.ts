import type { BaseCSSProperties } from 'jsxstyle-utils'

declare module 'jsxstyle-utils' {
  interface CSSProperties {
    hoverBorderColor?: BaseCSSProperties['borderColor']
    hoverBorderWidth?: BaseCSSProperties['borderSize']

    hoverBorderBottom?: BaseCSSProperties['borderBottom']
    hoverBorderLeft?: BaseCSSProperties['borderLeft']
    hoverBorderRight?: BaseCSSProperties['borderRight']
    hoverBorderTop?: BaseCSSProperties['borderTop']

    hoverHeight?: BaseCSSProperties['height']
    hoverWidth?: BaseCSSProperties['width']
  }
}
