const baseStyles =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ' +
  'transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const variantStyles = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-border text-ink hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:bg-danger-hover',
};

export default function Button({ variant = 'primary', className = '', ...props }) {
  const classes = [baseStyles, variantStyles[variant], className].filter(Boolean).join(' ');
  return <button className={classes} {...props} />;
}