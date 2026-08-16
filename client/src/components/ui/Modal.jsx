import { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={['w-full max-w-md rounded-md border border-border bg-surface p-6', className]
          .filter(Boolean)
          .join(' ')}
      >
        {title && (
          <h2 id="modal-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
        )}
        <div className={title ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>
  );
}