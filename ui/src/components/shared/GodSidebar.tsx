import { useState, useEffect, useRef } from 'react';
import './GodSidebar.css';

interface GodEntry {
  id: string;
  label: string;
  initial: string;
  port: number;
  color: string;
}

// Olympus Grid — infrastructure link, always first after home
const GRID: GodEntry = { id: 'olympus-grid', label: 'Olympus Grid', initial: 'OG', port: 3442, color: '#C8A84E' };

// Alpha first, Omega last, everything else alphabetical
const GODS: GodEntry[] = [
  { id: 'alpha',             label: '\u0391\u03BB\u03C6\u03B1',  initial: '\u03B1',  port: 3622, color: '#F5F5DC' },
  // A–Z agents
  { id: 'aeon',              label: 'Aeon',              initial: 'Ae',      port: 3582, color: '#95A5A6' },
  { id: 'aphrodite',         label: 'Aphrodite',         initial: '\u2661',  port: 3472, color: '#FF69B4' },
  { id: 'apollo',            label: 'Apollo',            initial: '\u03A6',  port: 3422, color: '#F39C12' },
  { id: 'ares',              label: 'Ares',              initial: 'Ar',      port: 3452, color: '#C0392B' },
  { id: 'argos',             label: 'Argos',             initial: 'Ag',      port: 3522, color: '#17A589' },
  { id: 'artemis',           label: 'Artemis',           initial: 'At',      port: 3612, color: '#A3E4D7' },
  { id: 'athena',            label: 'Athena',            initial: '\u0391',  port: 3402, color: '#4A9EBF' },
  { id: 'chronos',           label: 'Chronos',           initial: '\u03A7',  port: 3572, color: '#E74C3C' },
  { id: 'delphi',            label: 'Delphi',            initial: 'Dp',      port: 3722, color: '#D35400' },
  { id: 'demeter',           label: 'Demeter',           initial: '\u0394',  port: 3592, color: '#82C341' },
  { id: 'dionysus',          label: 'Dionysus',          initial: 'Dy',      port: 3602, color: '#A569BD' },
  { id: 'eos',               label: 'Eos',               initial: '\u0395',  port: 3532, color: '#D4AC0D' },
  { id: 'olympus-foundation',label: 'Foundation',        initial: 'OF',      port: 3632, color: '#BDC3C7' },
  { id: 'hades',             label: 'Hades',             initial: 'Hd',      port: 3642, color: '#7F8C8D' },
  { id: 'hecate',            label: 'Hecate',            initial: 'Hc',      port: 3652, color: '#6C3483' },
  { id: 'hephaestus',        label: 'Hephaestus',        initial: 'Hp',      port: 3512, color: '#DC7633' },
  { id: 'hera',              label: 'Hera',              initial: '\u0397',  port: 3492, color: '#9B59B6' },
  { id: 'hermes',            label: 'Hermes',            initial: 'H',       port: 3412, color: '#D4A843' },
  { id: 'hestia',            label: 'Hestia',            initial: 'Hs',      port: 3502, color: '#E67E22' },
  { id: 'iris',              label: 'Iris',              initial: '\u0399',  port: 3542, color: '#8E44AD' },
  { id: 'mnemosyne',         label: 'Mnemosyne',         initial: 'Mn',      port: 3712, color: '#85929E' },
  { id: 'odyssey-press',     label: 'Odyssey Press',     initial: 'OP',      port: 3672, color: '#5DADE2' },
  { id: 'oracle',            label: 'Oracle',            initial: 'Oc',      port: 3662, color: '#F1C40F' },
  { id: 'orion',             label: 'Orion',             initial: 'Or',      port: 3562, color: '#3498DB' },
  { id: 'plutus',            label: 'Plutus',            initial: 'Pl',      port: 3702, color: '#DAA520' },
  { id: 'poseidon',          label: 'Poseidon',          initial: '\u03A8',  port: 3432, color: '#2E86DE' },
  { id: 'proteus',           label: 'Proteus',           initial: '\u03A0',  port: 3462, color: '#27AE60' },
  { id: 'zeus',              label: 'Zeus',              initial: '\u0396',  port: 3482, color: '#FFD700' },
  // Omega — always last
  { id: 'omega',             label: '\u03A9\u03BC\u03AD\u03B3\u03B1',  initial: '\u03C9',  port: 3732, color: '#E8E4DC' },
];

interface GodSidebarProps {
  activeGod: string;
}

function renderGodLink(god: GodEntry, activeGod: string) {
  const isActive = god.id === activeGod;
  const dimBg = god.color + '18';
  const brightBg = god.color + '35';

  return (
    <a
      key={god.id}
      className={`god-sidebar__link${isActive ? ' god-sidebar__link--active' : ''}`}
      href={`http://localhost:${god.port}`}
      title={god.label}
    >
      <span
        className="god-sidebar__icon"
        style={{ background: isActive ? brightBg : dimBg }}
      >
        {god.initial}
      </span>
      <span className="god-sidebar__name">{god.label}</span>
    </a>
  );
}

export function GodSidebar({ activeGod }: GodSidebarProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const filterRef = useRef<HTMLInputElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const filteredGods = filter
    ? GODS.filter((g) => g.label.toLowerCase().includes(filter.toLowerCase()) || g.id.toLowerCase().includes(filter.toLowerCase()))
    : GODS;

  return (
    <>
      {/* Hamburger — mobile only */}
      <button
        className="god-sidebar__hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        <span className={`god-sidebar__hamburger-icon${open ? ' god-sidebar__hamburger-icon--open' : ''}`} />
      </button>

      {/* Backdrop — mobile only, visible when open */}
      {open && (
        <div className="god-sidebar__backdrop" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar nav */}
      <nav className={`god-sidebar${open ? ' god-sidebar--open' : ''}`}>
        <a className="god-sidebar__home" href="http://localhost:616" title="Olympus-616">
          <span className="god-sidebar__home-icon">&Omega;</span>
          <span className="god-sidebar__home-label">Olympus-616</span>
        </a>

        {renderGodLink(GRID, activeGod)}

        <div className="god-sidebar__divider" />

        {/* Filter input */}
        <div className="god-sidebar__filter">
          <svg className="god-sidebar__filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={filterRef}
            type="text"
            className="god-sidebar__filter-input"
            placeholder="Filter..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              className="god-sidebar__filter-clear"
              onClick={() => { setFilter(''); filterRef.current?.focus(); }}
              aria-label="Clear filter"
            >
              &#x2715;
            </button>
          )}
        </div>

        {filteredGods.map((god) => renderGodLink(god, activeGod))}

        {filteredGods.length === 0 && (
          <div className="god-sidebar__empty">No matches</div>
        )}
      </nav>
    </>
  );
}
