import { createContext } from 'react'

export enum View {
  Discussion,
  Timeline,
  Settings,
}

type ViewAction = [View, (view: View) => void]

export const ViewContext = createContext<ViewAction>([
  View.Discussion,
  (_view: View) => undefined
])
