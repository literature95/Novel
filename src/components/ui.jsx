// src/components/ui.jsx

export function clsx(...args) {
  return args.filter(Boolean).join(' ')
}

export function Badge({ variant = 'default', children, className = '' }) {
  const styles = {
    done: 'bg-verdant/15 text-verdant',
    progress: 'bg-ochre/15 text-ochre',
    locked: 'bg-faded/20 text-faded',
    error: 'bg-crimson/15 text-crimson',
    warning: 'bg-ochre/15 text-ochre',
    info: 'bg-cerulean/15 text-cerulean',
    default: 'bg-elevated text-ink'
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-mono font-medium',
      styles[variant] || styles.default,
      className
    )}>
      {children}
    </span>
  )
}

export function ProgressBar({ value, color = 'amber', className = '' }) {
  return (
    <div className={clsx('w-full h-[3px] bg-elevated rounded-full overflow-hidden', className)}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(value * 100, 100)}%`, backgroundColor: `var(--color-${color})` }}
      />
    </div>
  )
}

export function ProgressItem({ label, value, color }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="font-mono text-[0.72rem] w-10 shrink-0" style={{ color: `var(--color-${color})` }}>{label}</span>
      <div className="flex-1 h-[5px] bg-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value * 100}%`, backgroundColor: `var(--color-${color})` }} />
      </div>
      <span className="font-mono text-[0.65rem] text-faded w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  )
}

export function Dot({ status }) {
  const colors = { done: 'bg-verdant', progress: 'bg-ochre animate-pulse-dot', locked: 'bg-faded/40', skip: 'bg-faded/30' }
  return <span className={clsx('w-[7px] h-[7px] rounded-full shrink-0', colors[status] || colors.locked)} />
}

export function Btn({ variant = 'ghost', size = 'sm', children, className = '', ...props }) {
  const base = 'inline-flex items-center gap-1.5 rounded-[5px] font-serif transition-all duration-200 cursor-pointer select-none border'
  const sizes = { sm: 'text-[0.75rem] px-3 py-1.5', md: 'text-[0.82rem] px-4 py-2' }
  const variants = {
    primary: 'bg-amber text-deep font-semibold border-transparent hover:bg-amber-bright hover:shadow-[0_4px_12px_rgba(200,149,108,0.25)]',
    ghost: 'bg-transparent text-ink border-[var(--color-warm)] hover:text-parchment hover:bg-hover hover:border-faded',
    icon: 'bg-transparent text-faded border-transparent hover:text-parchment hover:bg-hover w-8 h-8 justify-center p-0'
  }
  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div className={clsx(
      'bg-surface border border-[var(--color-warm)] rounded-[10px] p-5 relative overflow-hidden',
      hover && 'cursor-pointer transition-all duration-250 hover:border-faded hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]',
      'after:absolute after:top-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber after:opacity-0 after:transition-opacity after:duration-250',
      hover && 'hover:after:opacity-100',
      className
    )} {...props}>
      {children}
    </div>
  )
}

export function ConflictBadge({ type }) {
  const map = { '内心冲突': 'bg-cerulean/12 text-cerulean', '人际冲突': 'bg-ochre/12 text-ochre', '外部威胁': 'bg-crimson/12 text-crimson' }
  return <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-[5px] text-[0.72rem] mr-1.5 mb-1.5', map[type] || '')}>{type}</span>
}

export function ForeshadowTag({ item, size = 'md' }) {
  const borderMap = { planted: 'border-l-cerulean', reinforced: 'border-l-ochre', overdue: 'border-l-crimson', resolved: 'border-l-verdant', drafted: 'border-l-faded' }
  const statusColor = { planted: 'text-cerulean', reinforced: 'text-ochre', resolved: 'text-verdant', drafted: 'text-faded' }
  return (
    <div className={clsx('bg-elevated rounded-[5px] border-l-[3px]', borderMap[item.status] || borderMap.drafted, size === 'sm' ? 'px-2.5 py-1.5' : 'px-3 py-2.5')}>
      <div className={clsx('font-medium text-parchment', size === 'sm' ? 'text-[0.75rem]' : 'text-[0.82rem]')}>{item.id}: {item.title}</div>
      {size !== 'sm' && <div className="text-[0.75rem] text-ink mt-1 leading-relaxed">{item.desc}</div>}
      <div className="flex gap-3 mt-1.5 font-mono text-[0.65rem]">
        <span className={statusColor[item.status] || 'text-faded'}>● {item.status}</span>
        <span className="text-faded">重要度: {item.importance}</span>
        <span className="text-faded">种植: {item.planted}</span>
        <span className="text-faded">截止: {item.deadline}</span>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-16 px-10">
      <div className="text-4xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg text-parchment mb-2">{title}</h3>
      <p className="text-[0.85rem] text-ink max-w-md mx-auto mb-6 leading-relaxed">{desc}</p>
      {action}
    </div>
  )
}
