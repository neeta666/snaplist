const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

const neutralStyles = 'bg-surface-muted text-ink-muted border border-border';

const statusStyles = {
  draft: 'bg-slate-100 text-slate-600 border border-slate-200',
  active: 'bg-green-50 text-green-700 border border-green-200',
  sold: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function Badge({ status, children, className = '' }) {
  const variantStyles = status && statusStyles[status] ? statusStyles[status] : neutralStyles;
  const classes = [baseStyles, variantStyles, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}