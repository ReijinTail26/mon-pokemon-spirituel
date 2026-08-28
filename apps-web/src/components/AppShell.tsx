import type {
  CSSProperties,
  ReactNode,
} from 'react'

import type {
  BackgroundTheme,
} from '../config/backgrounds'

import ClickHalo from './ClickHalo'

type AppShellProps = {
  background:
    BackgroundTheme | null

  children:
    ReactNode
}

function AppShell({
  background,
  children,
}: AppShellProps) {
  const style =
    background
      ? ({
          '--session-background':
            `url("${background.image}")`,

          '--accent':
            background.accent,

          '--accent-strong':
            background.accentStrong,

          '--accent-soft':
            background.accentSoft,

          '--overlay-top':
            background.overlayTop,

          '--overlay-bottom':
            background.overlayBottom,
        } as CSSProperties)
      : undefined

  return (
    <div
      className="app-shell"
      style={style}
    >
      <div
        className="background-layer"
      />

      <div
        className="background-overlay"
      />

      <div className="app-content">
        {children}
      </div>

      <ClickHalo />
    </div>
  )
}

export default AppShell