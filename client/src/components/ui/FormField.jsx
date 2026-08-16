export default function FormField({ label, htmlFor, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}