import { useState, useEffect, useCallback } from "react";

/* ─── types ─── */
type View = "terminus" | "heartbeat" | "killchain" | "history" | "config";
type SystemState = "ALIVE" | "DEAD" | "KILLING" | "REVIVING";
type ProcessStatus = "alive" | "terminating" | "dead";

interface GridProcess {
  name: string;
  env: string;
  node: string;
  pid: number | null;
  status: ProcessStatus;
  port: number;
  layer: string;
  terminatedAt: string | null;
  signal: string | null;
}

interface KillEvent {
  id: string;
  timestamp: string;
  scope: string;
  target: string;
  processes: number;
  duration: string;
  issuer: string;
  reason: string;
  type: "full" | "partial" | "flag" | "emergency";
}

/* ─── data ─── */
const mkProc = (name: string, port: number, layer: string): GridProcess => ({
  name, env: "local", node: "olympus-dev-01", pid: Math.floor(Math.random() * 10000) + 10000, status: "alive", port, layer, terminatedAt: null, signal: null,
});

const INIT_PROCESSES: GridProcess[] = [
  mkProc("Zeus", 3481, "Governance"), mkProc("Alpha", 3621, "Governance"), mkProc("Athena", 3401, "Intelligence"),
  mkProc("Hermes", 3411, "Transport"), mkProc("Oracle", 3661, "Security"), mkProc("Hecate", 3511, "Security"),
  mkProc("Proteus", 3461, "Data"), mkProc("Poseidon", 3431, "Transport"), mkProc("Hera", 3531, "Governance"),
  mkProc("Orion", 3561, "Orchestration"), mkProc("Mnemosyne", 3571, "Memory"), mkProc("Hephaestus", 3551, "Expression"),
  mkProc("Argos", 3521, "Infrastructure"), mkProc("Plutus", 3701, "Business"), mkProc("Iris", 3541, "Expression"),
  mkProc("Hestia", 3501, "Core"), mkProc("Apollo", 3421, "Expression"), mkProc("Dionysus", 3601, "Quality"),
  mkProc("Hades", 3641, "Infrastructure"), mkProc("Artemis", 3491, "Security"), mkProc("Chronos", 3581, "Governance"),
  mkProc("Delphi", 3611, "Intelligence"), mkProc("Demeter", 3591, "Governance"), mkProc("Eos", 3631, "Pipeline"),
  mkProc("Aeon", 3441, "Temporal"), mkProc("Aphrodite", 3471, "Expression"), mkProc("Ares", 3451, "Security"),
  mkProc("Foundation", 3651, "Core"), mkProc("Odyssey-Press", 3671, "Media"), mkProc("Omega", 3731, "Infrastructure"),
];

const KILL_HISTORY: KillEvent[] = [
  { id: "KE-047", timestamp: "2026-02-24 02:00:00", scope: "olympus-load-test", target: "All Processes", processes: 360, duration: "4.2s", issuer: "Dionysus", reason: "Load test complete — environment teardown", type: "full" },
  { id: "KE-046", timestamp: "2026-02-23 22:14:00", scope: "olympus-prod", target: "Hephaestus", processes: 8, duration: "1.8s", issuer: "Omega (auto)", reason: "GPU OOM cascade — forge batch endpoint unresponsive", type: "partial" },
  { id: "KE-045", timestamp: "2026-02-23 18:00:00", scope: "olympus-staging", target: "All Processes", processes: 30, duration: "2.1s", issuer: "Zeus (scheduled)", reason: "Nightly staging reset for clean deployment window", type: "full" },
  { id: "KE-044", timestamp: "2026-02-22 14:30:00", scope: "olympus-dev-local", target: "Artemis", processes: 1, duration: "0.2s", issuer: "Homer", reason: "Manual kill — debugging WAF rules in isolation", type: "partial" },
  { id: "KE-043", timestamp: "2026-02-21 03:00:00", scope: "ALL GRIDS", target: "ALL PROCESSES", processes: 448, duration: "8.4s", issuer: "Omega (emergency)", reason: "Security incident response — credential rotation required across all environments", type: "emergency" },
  { id: "KE-042", timestamp: "2026-02-20 12:00:00", scope: "olympus-prod-eu", target: "All Processes", processes: 18, duration: "1.4s", issuer: "Homer", reason: "EU region maintenance window — infrastructure update", type: "full" },
  { id: "KE-041", timestamp: "2026-02-19 08:00:00", scope: "olympus-dev-local", target: "Flag Toggle", processes: 30, duration: "0.0s", issuer: "Homer", reason: "Morning restart — toggled alive flag OFF then ON", type: "flag" },
  { id: "KE-040", timestamp: "2026-02-18 16:44:00", scope: "olympus-prod", target: "Orion", processes: 4, duration: "0.8s", issuer: "Omega (auto)", reason: "Runaway batch job consuming 94% cluster CPU", type: "partial" },
];

/* ─── helpers ─── */
const statusColor = (s: string) => {
  const m: Record<string, string> = { alive: "var(--success)", terminating: "var(--error)", dead: "var(--text-disabled)", ALIVE: "var(--success)", DEAD: "var(--error)", KILLING: "var(--error)", REVIVING: "var(--accent)" };
  return m[s] ?? "var(--text-secondary)";
};

const typeColor = (t: string) => {
  const m: Record<string, string> = { full: "var(--error)", partial: "var(--warning)", flag: "var(--accent)", emergency: "var(--error)" };
  return m[t] ?? "var(--text-secondary)";
};

/* ─── component ─── */
export default function Demo() {
  const [view, setView] = useState<View>("terminus");
  const [systemState, setSystemState] = useState<SystemState>("ALIVE");
  const [processes, setProcesses] = useState(INIT_PROCESSES);
  const [confirmKill, setConfirmKill] = useState<{ scope: string; callback: () => void } | null>(null);
  const [killCount, setKillCount] = useState(0);
  const [heartbeatLog, setHeartbeatLog] = useState<string[]>([]);
  const [aliveFlag, setAliveFlag] = useState(true);

  const alive = processes.filter(p => p.status === "alive").length;
  const total = processes.length;

  /* heartbeat pulse */
  useEffect(() => {
    const iv = setInterval(() => {
      if (!aliveFlag) return;
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
      const checkedProcs = processes.filter(p => p.status === "alive").length;
      setHeartbeatLog(prev => [`[${ts}] HEARTBEAT — ${checkedProcs}/${total} processes alive — flag: ALIVE`, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(iv);
  }, [aliveFlag, processes, total]);

  const killAll = useCallback(() => {
    setSystemState("KILLING");
    setConfirmKill(null);
    const procs = [...processes];
    let idx = 0;
    const iv = setInterval(() => {
      if (idx >= procs.length) {
        clearInterval(iv);
        setSystemState("DEAD");
        setAliveFlag(false);
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setHeartbeatLog(prev => [`[${ts}] OMEGA SIGNAL — ALL PROCESSES TERMINATED — flag: DEAD`, ...prev]);
        return;
      }
      const name = procs[idx].name;
      setProcesses(prev => prev.map(p => p.name === name ? { ...p, status: "terminating" as ProcessStatus, signal: "SIGKILL" } : p));
      setTimeout(() => {
        setProcesses(prev => prev.map(p => p.name === name ? { ...p, status: "dead" as ProcessStatus, pid: null, terminatedAt: new Date().toISOString() } : p));
        setKillCount(c => c + 1);
      }, 100);
      idx++;
    }, 80);
  }, [processes]);

  const reviveAll = useCallback(() => {
    setSystemState("REVIVING");
    setAliveFlag(true);
    const procs = [...processes];
    let idx = 0;
    const iv = setInterval(() => {
      if (idx >= procs.length) {
        clearInterval(iv);
        setSystemState("ALIVE");
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setHeartbeatLog(prev => [`[${ts}] OMEGA REVIVE — ALL PROCESSES RESTORED — flag: ALIVE`, ...prev]);
        return;
      }
      const name = procs[idx].name;
      setProcesses(prev => prev.map(p => p.name === name ? { ...p, status: "alive" as ProcessStatus, pid: Math.floor(Math.random() * 10000) + 10000, terminatedAt: null, signal: null } : p));
      idx++;
    }, 60);
  }, [processes]);

  const killSingle = useCallback((name: string) => {
    setProcesses(prev => prev.map(p => p.name === name ? { ...p, status: "terminating" as ProcessStatus, signal: "SIGTERM" } : p));
    setTimeout(() => {
      setProcesses(prev => prev.map(p => p.name === name && p.status === "terminating" ? { ...p, status: "dead" as ProcessStatus, pid: null, terminatedAt: new Date().toISOString() } : p));
      setKillCount(c => c + 1);
    }, 300);
  }, []);

  const toggleFlag = useCallback(() => {
    if (aliveFlag) {
      setConfirmKill({
        scope: "ALIVE FLAG \u2192 DEAD (all systems will terminate)",
        callback: () => {
          setAliveFlag(false);
          setConfirmKill(null);
          killAll();
        },
      });
    } else {
      setAliveFlag(true);
      reviveAll();
    }
  }, [aliveFlag, killAll, reviveAll]);

  const views: { key: View; label: string }[] = [
    { key: "terminus", label: "Terminus" },
    { key: "heartbeat", label: "Heartbeat" },
    { key: "killchain", label: "Kill Chain" },
    { key: "history", label: "History" },
    { key: "config", label: "Config" },
  ];

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* header */}
      <div className="flex-shrink-0 p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-2xl tracking-wider" style={{ color: systemState === "DEAD" ? "var(--error)" : "var(--accent)" }}>
              The Terminus
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Omega — the final word. Every process answers to this switch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded"
              style={{
                background: systemState === "ALIVE" ? "rgba(46,204,113,0.15)" : systemState === "DEAD" ? "rgba(192,57,43,0.15)" : "rgba(192,57,43,0.25)",
                color: statusColor(systemState),
                border: `1px solid ${statusColor(systemState)}`,
              }}
            >
              {systemState}
            </span>
          </div>
        </div>

        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-surface1)" }}>
          {views.map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
              style={{
                background: view === v.key ? "var(--accent-dim)" : "transparent",
                color: view === v.key ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">

        {/* ── TERMINUS ── */}
        {view === "terminus" && (
          <div className="space-y-4">
            {/* the big switch */}
            <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-surface1)", border: `2px solid ${systemState === "DEAD" ? "var(--error)" : "var(--border)"}` }}>
              <div className="text-xs font-mono mb-4" style={{ color: "var(--text-tertiary)" }}>OMEGA ALIVE FLAG</div>
              <button
                onClick={toggleFlag}
                className="w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300"
                style={{
                  background: aliveFlag ? "var(--success)" : "var(--error)",
                  boxShadow: `0 0 ${aliveFlag ? "40px rgba(46,204,113,0.4)" : "40px rgba(192,57,43,0.5)"}`,
                  border: "4px solid var(--bg-surface0)",
                }}
              >
                <span className="text-3xl font-display" style={{ color: "var(--bg-surface0)" }}>
                  {systemState === "KILLING" ? "\u23F3" : systemState === "REVIVING" ? "\u23F3" : aliveFlag ? "\u{1D6C0}" : "\u2620"}
                </span>
              </button>
              <div className="text-lg font-display mt-4" style={{ color: aliveFlag ? "var(--success)" : "var(--error)" }}>
                {systemState === "KILLING" ? "TERMINATING..." : systemState === "REVIVING" ? "REVIVING..." : aliveFlag ? "SYSTEM ALIVE" : "SYSTEM DEAD"}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                {aliveFlag ? `${alive}/${total} processes running` : "All processes terminated"}
              </div>
            </div>

            {/* quick actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setConfirmKill({ scope: "KILL ALL — every process in every grid", callback: killAll })}
                className="rounded-lg p-4 text-center transition-opacity hover:opacity-80"
                style={{ background: "var(--error)", color: "var(--bg-surface0)" }}
              >
                <div className="text-lg mb-1">{"\u2620"}</div>
                <div className="text-xs font-medium">Kill Everything</div>
                <div className="text-[10px] opacity-75">SIGKILL all processes</div>
              </button>
              <button
                onClick={reviveAll}
                className="rounded-lg p-4 text-center transition-opacity hover:opacity-80"
                style={{ background: "var(--success)", color: "var(--bg-surface0)" }}
              >
                <div className="text-lg mb-1">{"\u26A1"}</div>
                <div className="text-xs font-medium">Revive All</div>
                <div className="text-[10px] opacity-75">Restore all processes</div>
              </button>
              <button
                className="rounded-lg p-4 text-center transition-opacity hover:opacity-80"
                style={{ background: "var(--bg-surface1)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
              >
                <div className="text-lg mb-1">{"\u{1F6A8}"}</div>
                <div className="text-xs font-medium">Emergency Halt</div>
                <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>All grids, all envs</div>
              </button>
            </div>

            {/* process grid */}
            <div>
              <div className="text-xs font-mono mb-2" style={{ color: "var(--text-tertiary)" }}>PROCESS STATUS ({alive}/{total} alive)</div>
              <div className="grid grid-cols-6 gap-1.5">
                {processes.map(p => (
                  <div
                    key={p.name}
                    className="rounded p-2 text-center cursor-pointer transition-all"
                    style={{
                      background: p.status === "terminating" ? "rgba(192,57,43,0.2)" : "var(--bg-surface1)",
                      opacity: p.status === "dead" ? 0.35 : 1,
                    }}
                    onClick={() => p.status === "alive" ? killSingle(p.name) : undefined}
                    title={p.status === "alive" ? `Click to kill ${p.name}` : `${p.name} — ${p.status}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1 transition-all duration-200"
                      style={{
                        background: statusColor(p.status),
                        boxShadow: p.status === "terminating" ? "0 0 8px var(--error)" : p.status === "alive" ? "0 0 4px var(--success)" : "none",
                      }}
                    />
                    <div className="text-[9px] font-mono truncate" style={{ color: p.status === "dead" ? "var(--text-disabled)" : "var(--text-secondary)" }}>
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Total Kills", value: killCount + KILL_HISTORY.reduce((a, k) => a + k.processes, 0), color: "var(--error)" },
                { label: "Alive", value: alive, color: "var(--success)" },
                { label: "Dead", value: total - alive, color: "var(--text-disabled)" },
                { label: "Flag", value: aliveFlag ? "ALIVE" : "DEAD", color: aliveFlag ? "var(--success)" : "var(--error)" },
              ].map(s => (
                <div key={s.label} className="rounded-lg p-3" style={{ background: "var(--bg-surface1)" }}>
                  <div className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>{s.label}</div>
                  <div className="text-2xl font-display" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HEARTBEAT ── */}
        {view === "heartbeat" && (
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ background: "var(--bg-surface1)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Alive Flag Heartbeat</div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: aliveFlag ? "var(--success)" : "var(--error)",
                      boxShadow: aliveFlag ? "0 0 8px var(--success)" : "0 0 8px var(--error)",
                      animation: aliveFlag ? "pulse 2s infinite" : "none",
                    }}
                  />
                  <span className="text-xs font-mono font-bold" style={{ color: aliveFlag ? "var(--success)" : "var(--error)" }}>
                    {aliveFlag ? "ALIVE" : "DEAD"}
                  </span>
                </div>
              </div>
              <div className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                Every service polls this flag every 2 seconds. When the flag switches to DEAD, all services begin immediate
                graceful shutdown. No exceptions, no overrides. The flag propagates through every grid, every environment,
                every node worldwide.
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Poll Interval", value: "2s" },
                  { label: "Propagation", value: "< 50ms" },
                  { label: "Coverage", value: "All grids" },
                ].map(s => (
                  <div key={s.label} className="rounded p-2" style={{ background: "var(--bg-surface2)" }}>
                    <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.label}</div>
                    <div className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* heartbeat log */}
            <div>
              <div className="text-xs font-mono mb-2" style={{ color: "var(--text-tertiary)" }}>HEARTBEAT LOG</div>
              <div className="rounded-lg overflow-hidden" style={{ background: "var(--bg-surface0)", border: "1px solid var(--border)", maxHeight: "50vh", overflowY: "auto" }}>
                {heartbeatLog.length === 0 ? (
                  <div className="text-xs text-center py-6" style={{ color: "var(--text-disabled)" }}>Waiting for heartbeat...</div>
                ) : heartbeatLog.map((entry, i) => (
                  <div key={i} className="px-3 py-1.5 text-xs font-mono border-b last:border-b-0" style={{ borderColor: "var(--border)", color: entry.includes("OMEGA") ? "var(--error)" : entry.includes("REVIVE") ? "var(--success)" : "var(--text-secondary)" }}>
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── KILL CHAIN ── */}
        {view === "killchain" && (
          <div className="space-y-4">
            <div className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>KILL CHAIN — process termination order</div>

            <div className="rounded-lg p-4" style={{ background: "var(--bg-surface1)" }}>
              <div className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>Termination Sequence</div>
              <div className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
                When Omega issues a kill directive, processes are terminated in reverse dependency order
                to ensure clean shutdown. Data-layer services stop last to allow in-flight writes to complete.
              </div>
              {[
                { phase: "Phase 1", label: "User-Facing", services: ["Iris", "Odyssey-Press", "Apollo", "Aphrodite"], signal: "SIGTERM", grace: "5s" },
                { phase: "Phase 2", label: "Business Logic", services: ["Plutus", "Hera", "Alpha", "Demeter", "Chronos", "Delphi"], signal: "SIGTERM", grace: "5s" },
                { phase: "Phase 3", label: "Orchestration", services: ["Orion", "Hephaestus", "Dionysus", "Eos", "Aeon", "Foundation"], signal: "SIGTERM", grace: "10s" },
                { phase: "Phase 4", label: "Transport", services: ["Hermes", "Poseidon", "Ares", "Argos"], signal: "SIGTERM", grace: "10s" },
                { phase: "Phase 5", label: "Data & Memory", services: ["Proteus", "Mnemosyne", "Hestia", "Hades"], signal: "SIGTERM", grace: "15s" },
                { phase: "Phase 6", label: "Security", services: ["Oracle", "Hecate", "Artemis"], signal: "SIGTERM", grace: "5s" },
                { phase: "Phase 7", label: "Control Plane", services: ["Zeus"], signal: "SIGTERM", grace: "10s" },
                { phase: "Phase 8", label: "Omega Self", services: ["Omega"], signal: "SIGTERM", grace: "—" },
              ].map((phase, i) => (
                <div key={phase.phase} className="flex items-center gap-3 mb-2">
                  <div className="w-16 flex-shrink-0 text-[10px] font-mono text-right" style={{ color: "var(--text-tertiary)" }}>{phase.phase}</div>
                  <div className="w-3 flex flex-col items-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full" style={{ background: i === 7 ? "var(--error)" : "var(--accent)" }} />
                    {i < 7 && <div className="w-px h-4" style={{ background: "var(--border)" }} />}
                  </div>
                  <div className="flex-1 rounded p-2" style={{ background: "var(--bg-surface2)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{phase.label}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span style={{ color: "var(--error)" }}>{phase.signal}</span>
                        <span style={{ color: "var(--text-tertiary)" }}>grace: {phase.grace}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {phase.services.map(s => (
                        <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bg-surface1)", color: "var(--text-secondary)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: "var(--bg-surface1)", borderLeft: "3px solid var(--error)" }}>
              <span className="text-lg">{"\u26A0"}</span>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>SIGKILL Escalation</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  If any process does not exit within its grace period, Omega escalates to SIGKILL.
                  In emergency mode, all grace periods are zero — immediate SIGKILL to every process simultaneously.
                  CI/CD pipelines receive an abort signal. Scheduled jobs are cancelled. Queue consumers are disconnected.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {view === "history" && (
          <div className="space-y-2">
            <div className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>KILL EVENT HISTORY ({KILL_HISTORY.length})</div>
            {KILL_HISTORY.map(k => (
              <div key={k.id} className="rounded-lg p-3" style={{ background: "var(--bg-surface1)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${typeColor(k.type)} 15%, transparent)`, color: typeColor(k.type) }}>
                      {k.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{k.target}</span>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{k.scope}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono" style={{ color: "var(--error)" }}>{k.processes} killed</span>
                    <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{k.duration}</span>
                  </div>
                </div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{k.reason}</div>
                <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--text-disabled)" }}>
                  <span>{k.issuer}</span>
                  <span className="font-mono">{k.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONFIG ── */}
        {view === "config" && (
          <div className="space-y-4">
            <div className="text-xs font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>OMEGA CONFIGURATION</div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Kill Signal (Normal)", value: "SIGTERM", desc: "Graceful shutdown — allows in-flight operations to complete" },
                { label: "Kill Signal (Emergency)", value: "SIGKILL", desc: "Immediate termination — no grace period, no cleanup" },
                { label: "Grace Period (Default)", value: "10 seconds", desc: "Maximum time to wait before escalating to SIGKILL" },
                { label: "Grace Period (Data Layer)", value: "15 seconds", desc: "Extended grace for Proteus, Mnemosyne, Hestia, Hades" },
                { label: "Heartbeat Interval", value: "2 seconds", desc: "How often services poll the alive flag" },
                { label: "Propagation Target", value: "< 50ms", desc: "Maximum time for flag change to reach all nodes" },
                { label: "Auto-Kill Triggers", value: "Enabled", desc: "Omega can auto-kill on OOM, cascade failure, security alert" },
                { label: "CI/CD Abort", value: "Enabled", desc: "All pipeline runs receive abort signal on grid kill" },
                { label: "Queue Drain", value: "Enabled", desc: "Message queues are drained before transport shutdown" },
                { label: "Audit Logging", value: "Mandatory", desc: "Every kill event is logged to immutable audit trail" },
                { label: "Self-Termination", value: "Last", desc: "Omega is always the last process to terminate" },
                { label: "Recovery Mode", value: "Manual", desc: "After full kill, revival requires explicit directive" },
              ].map(c => (
                <div key={c.label} className="rounded-lg p-3" style={{ background: "var(--bg-surface1)" }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.label}</span>
                    <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>{c.value}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{c.desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: "var(--bg-surface1)", borderLeft: "3px solid var(--error)" }}>
              <span className="text-lg">{"\u{1F480}"}</span>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Omega Override</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Omega cannot be overridden, paused, or bypassed by any other service — including Zeus.
                  When Omega speaks, the system obeys. This is the absolute last line of defense, ensuring that
                  no runaway process, no rogue agent, and no cascade failure can persist beyond Omega's directive.
                  The only entity that survives an Omega kill is Omega itself — until it self-terminates as the final act.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {confirmKill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-xl p-6 w-full max-w-sm text-center" style={{ background: "var(--bg-surface1)", border: "2px solid var(--error)" }}>
            <div className="text-4xl mb-3">{"\u2620"}</div>
            <div className="font-display text-xl mb-2" style={{ color: "var(--error)" }}>Confirm Kill</div>
            <div className="text-sm mb-4 font-mono" style={{ color: "var(--text-secondary)" }}>
              {confirmKill.scope}
            </div>
            <div className="text-[10px] mb-4" style={{ color: "var(--text-tertiary)" }}>
              This action will immediately terminate all targeted processes. This cannot be undone.
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmKill.callback}
                className="text-xs px-6 py-2.5 rounded font-medium font-mono"
                style={{ background: "var(--error)", color: "var(--bg-surface0)" }}
              >
                EXECUTE KILL
              </button>
              <button
                onClick={() => setConfirmKill(null)}
                className="text-xs px-4 py-2.5 rounded"
                style={{ background: "var(--bg-surface2)", color: "var(--text-secondary)" }}
              >
                Abort
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
