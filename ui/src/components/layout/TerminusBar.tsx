import { useState, useEffect, useRef } from 'react'
import type { StatusResponse } from '../../types/omega'
import './TerminusBar.css'

function formatUptime(seconds: number): string {
  if (seconds < 60) return seconds + 's'
  const m = Math.floor(seconds / 60)
  const rs = seconds % 60
  if (m < 60) return m + 'm ' + rs + 's'
  const h = Math.floor(m / 60)
  const rm = m % 60
  if (h < 24) return h + 'h ' + rm + 'm'
  const d = Math.floor(h / 24)
  return d + 'd ' + (h % 24) + 'h'
}

interface Props {
  healthy: boolean | null; healthLoading: boolean; healthError: string | null; lastChecked: Date | null;
  status: StatusResponse | null; statusLoading: boolean; statusError: string | null;
  onRefreshHealth: () => void; onRefreshStatus: () => void;
}

export default function TerminusBar({ healthy, healthLoading, healthError, lastChecked, status, statusLoading, statusError, onRefreshHealth, onRefreshStatus }: Props) {
  const [open, setOpen] = useState(false)
  const barRef = useRef<HTMLElement>(null)

  useEffect(() => { if (!open) return; const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [open])
  useEffect(() => { if (!open) return; const handler = (e: MouseEvent) => { if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(false) }; window.addEventListener('mousedown', handler); return () => window.removeEventListener('mousedown', handler) }, [open])

  const handleToggle = () => { if (!open) { onRefreshHealth(); onRefreshStatus() } setOpen((v) => !v) }
  const online = healthy === true
  const dotClass = online ? 'tm-dot--on' : healthy === false ? 'tm-dot--off' : 'tm-dot--unknown'
  const statusLabel = online ? 'Connected' : healthy === false ? 'Disconnected' : 'Unknown'

  return (
    <footer ref={barRef} className="tm-footer">
      <div className={`tm-panel ${open ? 'tm-panel--open' : ''}`}>
        <div className="tm-panel-inner">
          <div className="tm-section">
            <div className="tm-section-head"><span className={`tm-dot-sm ${dotClass}`} /><span className="tm-section-label">Health</span></div>
            <div className="tm-grid">
              <span className="tm-k">Status</span><span className={`tm-v ${online ? 'tm-v--ok' : healthy === false ? 'tm-v--err' : ''}`}>{statusLabel}</span>
              {lastChecked && (<><span className="tm-k">Last Check</span><span className="tm-v">{lastChecked.toLocaleTimeString()}</span></>)}
            </div>
            {healthError && <div className="tm-error">{healthError}</div>}
          </div>
          <div className="tm-section">
            <div className="tm-section-head"><span className="tm-dot-sm tm-dot--accent" /><span className="tm-section-label">Service Info</span></div>
            {statusLoading ? (<div className="tm-loading">Loading...</div>) : statusError ? (<div className="tm-error">{statusError}</div>) : status ? (
              <div className="tm-grid">
                {status.service && (<><span className="tm-k">Service</span><span className="tm-v">{status.service}</span></>)}
                {status.version && (<><span className="tm-k">Version</span><span className="tm-v">{status.version}</span></>)}
                {status.uptimeSeconds != null && (<><span className="tm-k">Uptime</span><span className="tm-v tm-v--ok">{formatUptime(status.uptimeSeconds)}</span></>)}
              </div>
            ) : (<div className="tm-loading">No status data</div>)}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRefreshHealth(); onRefreshStatus() }} className="tm-refresh">Refresh</button>
        </div>
      </div>
      <div className="tm-bar" onClick={handleToggle}>
        <div className="tm-left">
          <span className={`tm-dot ${dotClass} ${healthLoading ? 'tm-dot--pulse' : ''}`} />
          <span className="tm-brand">TERMINUS</span>
        </div>
        <div className="tm-right">
          {status?.service && (<span className="tm-stat"><span className="tm-k">SERVICE</span><span className="tm-v">{status.service}</span></span>)}
          {status?.uptimeSeconds != null && (<><span className="tm-sep" /><span className="tm-stat"><span className="tm-k">UPTIME</span><span className="tm-v">{formatUptime(status.uptimeSeconds)}</span></span></>)}
          {status?.version && (<><span className="tm-sep" /><span className="tm-stat"><span className="tm-k">VERSION</span><span className="tm-v">{status.version}</span></span></>)}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`tm-chevron ${open ? 'tm-chevron--open' : ''}`}><polyline points="2 6 5 3 8 6" /></svg>
        </div>
      </div>
    </footer>
  )
}
