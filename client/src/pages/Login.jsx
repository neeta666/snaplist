// Login page.
//
// On success: the backend returns { user, token } (API Contract, section
// 2.2) — same pattern as Register, calling setAuth directly with the fresh
// user object rather than a redundant follow-up GET /auth/me.
//
// Per the API Contract, invalid credentials always come back as a single
// generic 401 with no field-level errors (the backend never reveals
// whether the email or the password was wrong) — so that case is always
// shown as a general form error, never attached to a specific field.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginSchema } from '../schemas/authSchemas';
import { apiClient } from '../lib/apiClient';
import { extractApiError } from '../lib/apiErrors';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      navigate('/dashboard');
    } catch (error) {
      const { message, fieldErrors } = extractApiError(error);

      // 422 (missing fields) can have real field-level errors; 401
      // (invalid credentials) and 429 (rate limited) never do, per the API
      // Contract, and are always shown as a general message instead.
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
      <h1 className="text-xl font-semibold text-gray-900">Log in</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-gray-900 underline">
          Register
        </Link>
      </p>
    </div>
  );
}