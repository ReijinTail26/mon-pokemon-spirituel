import type {
  CSSProperties,
  ReactNode,
} from 'react'
import {
  useEffect,
  useState,
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
  const [interfaceHidden, setInterfaceHidden] =
    useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle(
      'interface-hidden',
      interfaceHidden,
    )

    return () => {
      document.documentElement.classList.remove(
        'interface-hidden',
      )
    }
  }, [interfaceHidden])

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
      className={`app-shell${interfaceHidden ? ' interface-hidden-view' : ''}`}
      style={style}
    >
      <div
        className="background-layer"
      />

      <div
        className="background-overlay"
      />

      <div className="interface-toolbar">
        <button
          className="interface-toggle-button"
          type="button"
          aria-pressed={interfaceHidden}
          onClick={() => setInterfaceHidden(current => !current)}
        >
          <span aria-hidden="true">{interfaceHidden ? '✦' : '◉'}</span>
          {interfaceHidden ? 'Afficher l’interface' : 'Masquer l’interface'}
        </button>
      </div>

      <div className="app-content">
        {children}
      </div>

      <ClickHalo />
    </div>
  )
}

export default AppShell
