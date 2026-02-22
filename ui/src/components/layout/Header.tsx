export default function Header() {
  return (
    <header className="flex h-[52px] flex-shrink-0 items-center justify-between border-b border-border bg-surface0 px-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{'\u03A9'}</span>
        <span className="font-display text-h3 font-semibold tracking-wider text-accent">OMEGA</span>
        <span className="text-sm tracking-widest text-text-tertiary">OLYMPUS-616</span>
      </div>
    </header>
  );
}
