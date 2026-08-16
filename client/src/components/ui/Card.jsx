export default function Card({ children, className = '' }) {
  const classes = ['rounded-md border border-border bg-surface', className].filter(Boolean).join(' ');
  return <div className={classes}>{children}</div>;
}