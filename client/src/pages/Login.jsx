import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchemas';
import { apiClient } from '../lib/apiClient';
import { extractApiError } from '../lib/apiErrors';
import { useAuthStore } from '../store/authStore';
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import symbolMark from '../assets/snaplist-symbol.png';
import wordmark from '../assets/snaplist-wordmark.png';

function MailIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.1 2.8" />
      <path d="M6.2 6.2C3.8 7.8 2.5 12 2.5 12S6 18 12 18c1.6 0 3-.4 4.2-1" />
      <path d="M9.9 9.9A3 3 0 0 0 14.1 14" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setFormError('');
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', values);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/listings/new');
    } catch (error) {
      const { message, fieldErrors } = extractApiError(error);

      let matchedAnyField = false;
      fieldErrors.forEach(({ field, message: fieldMessage }) => {
        if (field === 'email' || field === 'password') {
          setError(field, { type: 'server', message: fieldMessage });
          matchedAnyField = true;
        }
      });

      if (!matchedAnyField) {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-14 flex items-center gap-2.5 lg:hidden">
        <img
          src={symbolMark}
          alt=""
          className="h-11 w-11 sm:h-13 sm:w-13"
        />
        <img
          src={wordmark}
          alt="SnapList"
          className="h-12 translate-y-0.5 sm:h-14"
        />
      </div>

      <div className="hidden lg:block">
        <h1
          className="text-3xl font-bold tracking-tight text-ink"
          style={{ color: '#052272' }}
        >
          Welcome back!
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Log in to continue creating listings.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-sm md:p-7 lg:mt-8">
        <div className="mb-7 text-center lg:hidden">
          <h1
            className="text-3xl font-bold tracking-tight text-ink"
            style={{ color: '#052272' }}
          >
            Welcome back!
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Log in to continue creating listings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-ink placeholder:text-ink-subtle"
              />
            </div>
          </FormField>

          <FormField label="Password" htmlFor="password" error={errors.password?.message}>
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className="block h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-11 text-sm text-ink placeholder:text-ink-subtle"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-brand-tint hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </FormField>

          {formError && <p className="text-sm text-danger">{formError}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full justify-center"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        <p className="mt-6 border-t border-border pt-5 text-center text-sm text-ink-muted">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:text-brand-hover">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}