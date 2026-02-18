import type { ReactNode } from 'react'
import type { AutomationMode } from '../types/workbench'
import { CarryTraceIcon } from './icons/CarryTraceIcon'
import { PulseGridIcon } from './icons/PulseGridIcon'
import { RiftMarkerIcon } from './icons/RiftMarkerIcon'

interface ModeRailProps {
  mode: AutomationMode
  onModeChange: (mode: AutomationMode) => void
}

const modes: Array<{ mode: AutomationMode; label: string; icon: ReactNode }> = [
  { mode: 'create', label: 'SKAPA', icon: <RiftMarkerIcon /> },
  { mode: 'edit', label: 'REDIGERA', icon: <CarryTraceIcon /> },
  { mode: 'debug', label: 'FELSÖK', icon: <PulseGridIcon /> },
]

export function ModeRail({ mode, onModeChange }: ModeRailProps) {
  return (
    <nav className="mode-rail" aria-label="Lägen">
      {modes.map((item) => (
        <button
          key={item.mode}
          type="button"
          className={`mode-rail-item ${mode === item.mode ? 'active' : ''}`}
          onClick={() => onModeChange(item.mode)}
        >
          <span className="mode-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
